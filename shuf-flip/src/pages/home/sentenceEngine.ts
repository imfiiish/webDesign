import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, RefObject } from 'react'
import { SENTENCES } from './sentenceData'
import type { SentenceEntry } from './sentenceData'

/** Strip tone marks so "wǒ" and "wo" compare equal. */
export function toneless(s: string): string {
  return s
    .replace(/ü/g, 'v')
    .replace(/Ü/g, 'v')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

/** Deterministic shuffle so a sentence's word bank is stable across renders. */
export function bankOrder(n: number, seed: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i)
  let s = (seed * 2654435761) % 4294967296
  for (let i = n - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export type Slot = { token: number | null }

const makeSlots = (n: number): Slot[] =>
  Array.from({ length: n }, () => ({ token: null }))

/** A word of the English sentence, plus which tokens claim it (via the `en`
 *  gloss) so the matching word can light up on submit. */
export type TranslationWord = { text: string; owners: number[] }

export function mapTranslation(entry: SentenceEntry): TranslationWord[] {
  const words = entry.translation.match(/\S+/g) ?? []
  const norm = words.map((w) => w.toLowerCase().replace(/[^a-z]/g, ''))
  const owners: number[][] = words.map(() => [])

  entry.tokens.forEach((token, ti) => {
    const gloss = token.en.toLowerCase().match(/[a-z]+/g) ?? []
    if (gloss.length === 0) return
    for (let s = 0; s + gloss.length <= norm.length; s++) {
      let ok = true
      for (let k = 0; k < gloss.length; k++) {
        if (norm[s + k] !== gloss[k]) {
          ok = false
          break
        }
      }
      if (ok) {
        for (let k = 0; k < gloss.length; k++) owners[s + k].push(ti)
        break
      }
    }
  })

  return words.map((text, i) => ({ text, owners: owners[i] }))
}

/** Everything a sentence board needs. */
export type SentenceGame = {
  entry: SentenceEntry
  words: TranslationWord[]
  bank: number[]
  slots: Slot[]
  active: number
  results: boolean[] | null
  flash: boolean[]
  pending: string
  typed: string
  score: number
  done: (i: number) => boolean
  failed: (i: number) => boolean
  pick: (j: number) => void
  remove: (i: number) => void
  selectBlank: (i: number) => void
  typer: RefObject<HTMLInputElement | null>
  onType: (value: string) => void
  onKey: (e: KeyboardEvent<HTMLInputElement>) => void
}

/** Creative › Sentence — the exercise engine. The full English sentence is the
 *  prompt, the shuffled tokens are a bank. Click a token or just type anywhere:
 *  the letters show up in the active blank as a highlighted "selection" and
 *  turn into the hanzi as soon as they match. Space / Tab = next blank,
 *  Backspace = back a blank (again = remove that word), Enter = submit. */
export function useSentenceGame(): SentenceGame {
  const [round, setRound] = useState(0)
  const entry = SENTENCES[round]
  const words = useMemo(() => mapTranslation(entry), [entry])
  const bank = useMemo(
    () => bankOrder(entry.tokens.length, entry.order),
    [entry],
  )
  const [slots, setSlots] = useState<Slot[]>(() =>
    makeSlots(SENTENCES[0].tokens.length),
  )
  const [active, setActive] = useState(0)
  const [results, setResults] = useState<boolean[] | null>(null)
  const [flash, setFlash] = useState<boolean[]>([])
  const [pending, setPending] = useState('')
  const typer = useRef<HTMLInputElement>(null)
  const flashTimer = useRef<number | undefined>(undefined)

  // Feedback is frozen at each submit; editing does not repaint it.
  const done = (i: number) => results?.[i] === true
  const failed = (i: number) => results?.[i] === false

  /** Next blank to move to that is not locked correct; `wrap` searches past the end. */
  const nextOpen = (from: number, wrap: boolean): number => {
    const n = entry.tokens.length
    for (let s = 1; s <= n; s++) {
      const k = from + s
      if (!wrap && k >= n) break
      const idx = k % n
      if (!done(idx)) return idx
    }
    return from
  }

  // The hidden input holds focus; clicking anywhere focuses it again so you can
  // just start typing. preventDefault stops the browser from moving focus to
  // whatever was clicked (which is why a blank had to be clicked before).
  useEffect(() => {
    typer.current?.focus()
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      if (el?.closest('input, textarea, [contenteditable="true"]')) return
      e.preventDefault()
      typer.current?.focus()
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [])

  useEffect(() => () => window.clearTimeout(flashTimer.current), [])

  /** Move to the next empty blank, wrapping; stay put if all are filled. */
  const nextEmpty = (from: number, arr: Slot[]): number => {
    const n = arr.length
    for (let s = 1; s <= n; s++) {
      const k = (from + s) % n
      if (arr[k].token === null) return k
    }
    return from
  }

  const settle = (arr: Slot[], from: number) => {
    setActive(nextEmpty(from, arr))
  }

  const nextSentence = () => {
    const r = (round + 1) % SENTENCES.length
    setRound(r)
    setSlots(makeSlots(SENTENCES[r].tokens.length))
    setActive(0)
    setResults(null)
    setFlash([])
    setPending('')
  }

  const place = (j: number, target: number) => {
    const next = slots.map((s) => ({ ...s }))
    const existing = next.findIndex((s) => s.token === j)
    if (existing !== -1) next[existing] = { token: null }
    next[target] = { token: j }
    setSlots(next)
    settle(next, target)
  }

  const pick = (j: number) => {
    setPending('')
    place(j, active)
    typer.current?.focus()
  }

  /** Typed letters fill a buffer. A unique, *complete* pinyin places at once;
   *  partial or ambiguous input waits for Space / Enter. */
  const type = (value: string) => {
    if (value === '') {
      setPending('')
      return
    }
    // typing over a filled blank clears it first
    if (slots[active]?.token !== null) {
      setSlots((prev) =>
        prev.map((s, k) => (k === active ? { token: null } : s)),
      )
    }
    const v = toneless(value)
    const used = new Set(slots.map((s) => s.token))
    let exact: number | null = null
    let candidates = 0
    for (let j = 0; j < entry.tokens.length; j++) {
      if (used.has(j)) continue
      const p = toneless(entry.tokens[j].pinyin)
      if (p === v) exact = j
      if (p.startsWith(v)) candidates++
    }
    if (exact !== null && candidates === 1) {
      const next = slots.map((s, k) => (k === active ? { token: exact } : s))
      setSlots(next)
      setPending('')
      setActive(nextEmpty(active, next))
      return
    }
    setPending(value)
  }

  /** Resolve the buffer: exact pinyin first, else a unique prefix. */
  const resolve = (value: string): number | null => {
    const v = toneless(value)
    if (v === '') return null
    const used = new Set(slots.map((s) => s.token))
    for (let j = 0; j < entry.tokens.length; j++) {
      if (!used.has(j) && toneless(entry.tokens[j].pinyin) === v) return j
    }
    const candidates: number[] = []
    for (let j = 0; j < entry.tokens.length; j++) {
      if (!used.has(j) && toneless(entry.tokens[j].pinyin).startsWith(v)) {
        candidates.push(j)
      }
    }
    return candidates.length === 1 ? candidates[0] : null
  }

  /** Commit the buffer into the active blank; `advance` moves on afterwards. */
  const commit = (advance: boolean) => {
    if (pending === '') {
      if (advance) setActive(nextOpen(active, true))
      return
    }
    const j = resolve(pending)
    if (j === null) return
    const next = slots.map((s, k) => (k === active ? { token: j } : s))
    setSlots(next)
    setPending('')
    if (advance) setActive(nextEmpty(active, next))
  }

  /** Previous blank that is not already locked correct; stops at the start. */
  const prevEditable = (from: number): number => {
    for (let k = from - 1; k >= 0; k--) {
      if (!done(k)) return k
    }
    return from
  }

  const remove = (i: number) => {
    if (done(i)) return
    setSlots((prev) => prev.map((s, k) => (k === i ? { token: null } : s)))
    setActive(i)
    setPending('')
    typer.current?.focus()
  }

  const selectBlank = (i: number) => {
    setActive(i)
    setPending('')
    typer.current?.focus()
  }

  /** Enter. First time: mark, then empty the wrong blanks and jump to the first
   *  one. Again when everything is right: go to the next sentence. */
  const submit = () => {
    const fresh = slots.map((s, i) => s.token === i)
    if (results && fresh.every(Boolean)) {
      nextSentence()
      return
    }
    setResults(fresh)
    setPending('')
    const wrong = fresh.map((ok, i) => (ok ? -1 : i)).filter((i) => i !== -1)
    if (wrong.length > 0) {
      setSlots(slots.map((s, i) => (wrong.includes(i) ? { token: null } : s)))
      setActive(wrong[0])
    }
    // wrong blanks flash red once, then settle back to normal
    setFlash(fresh.map((ok) => !ok))
    window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setFlash([]), 680)
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Tab') {
      // Space / Tab commit the buffer (or just move on when it is empty).
      e.preventDefault()
      commit(true)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      // With letters pending, Enter commits them; otherwise it submits.
      if (pending !== '') commit(false)
      else submit()
      return
    }
    if (e.key === 'Backspace' && pending === '') {
      // Empty buffer: remove this word if it has one, else step back to the
      // previous editable blank (skipping ones already locked correct).
      e.preventDefault()
      const canRemove = slots[active]?.token !== null && !done(active)
      if (canRemove) {
        remove(active)
      } else {
        const prev = prevEditable(active)
        if (prev !== active) setActive(prev)
      }
    }
    // Backspace with text pending falls through: the input drops a letter.
  }

  const score = results ? results.filter(Boolean).length : 0
  const typed = toneless(pending)

  return {
    entry,
    words,
    bank,
    slots,
    active,
    results,
    flash,
    pending,
    typed,
    score,
    done,
    failed,
    pick,
    remove,
    selectBlank,
    typer,
    onType: type,
    onKey,
  }
}
