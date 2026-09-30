import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useI18n } from '../../i18n'
import { SENTENCES } from './sentenceData'
import type { SentenceEntry } from './sentenceData'
import './sentence.css'

/** Strip tone marks so "wǒ" and "wo" compare equal. */
function toneless(s: string): string {
  return s
    .replace(/ü/g, 'v')
    .replace(/Ü/g, 'v')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

/** Deterministic shuffle so a sentence's word bank is stable across renders. */
function bankOrder(n: number, seed: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i)
  let s = (seed * 2654435761) % 4294967296
  for (let i = n - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Slot = { token: number | null }

const makeSlots = (n: number): Slot[] =>
  Array.from({ length: n }, () => ({ token: null }))

/** A word of the English sentence, plus which tokens claim it (via the `en`
 *  gloss) so the matching word can light up on submit. */
type TranslationWord = { text: string; owners: number[] }

function mapTranslation(entry: SentenceEntry): TranslationWord[] {
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

/** Creative › Sentence — a grammar exercise. The full English sentence is the
 *  prompt, the shuffled tokens are a bank. Click a token or just type anywhere:
 *  the letters show up in the active blank as a highlighted "selection" and
 *  turn into the hanzi as soon as they match. Space / Tab = next blank,
 *  Backspace = back a blank (again = remove that word), Enter = submit. */
export default function SentenceFill() {
  const { t } = useI18n()
  const [round, setRound] = useState(0)
  const entry = SENTENCES[round]
  const words = useMemo(() => mapTranslation(entry), [entry])
  const bank = useMemo(() => bankOrder(entry.tokens.length, entry.order), [entry])
  const [slots, setSlots] = useState<Slot[]>(() => makeSlots(SENTENCES[0].tokens.length))
  const [active, setActive] = useState(0)
  const [checked, setChecked] = useState(false)
  const [pending, setPending] = useState('')
  const typer = useRef<HTMLInputElement>(null)

  const rightAt = (i: number) => slots[i]?.token === i
  const isOpen = (k: number, arr: Slot[]) => !(checked && arr[k]?.token === k)

  /** Next blank to move to; `wrap` also searches past the end. */
  const nextOpen = (from: number, arr: Slot[], wrap: boolean): number => {
    const n = arr.length
    for (let s = 1; s <= n; s++) {
      const k = from + s
      if (!wrap && k >= n) break
      const idx = k % n
      if (isOpen(idx, arr)) return idx
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

  const settle = (arr: Slot[], from: number) => {
    setActive(nextOpen(from, arr, false))
  }

  const nextSentence = () => {
    const r = (round + 1) % SENTENCES.length
    setRound(r)
    setSlots(makeSlots(SENTENCES[r].tokens.length))
    setActive(0)
    setChecked(false)
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

  /** Typed letters: keep them visible ("selected") until they match a token. */
  const type = (value: string) => {
    if (value === '') {
      setPending('')
      return
    }
    // typing over a filled blank replaces its word
    const base =
      slots[active]?.token !== null
        ? slots.map((s, k) => (k === active ? { token: null } : s))
        : slots
    const used = new Set(base.map((s) => s.token))
    let found: number | null = null
    for (let j = 0; j < entry.tokens.length; j++) {
      if (used.has(j)) continue
      const token = entry.tokens[j]
      if (value === token.text || toneless(value) === toneless(token.pinyin)) {
        found = j
        break
      }
    }
    if (found === null) {
      if (base !== slots) setSlots(base)
      setPending(value)
      return
    }
    const j = found
    const next = base.map((s, k) => (k === active ? { token: j } : s))
    setSlots(next)
    setPending('')
    settle(next, active)
  }

  const remove = (i: number) => {
    if (checked && rightAt(i)) return
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
    const wrong = slots
      .map((s, i) => (s.token === i ? -1 : i))
      .filter((i) => i !== -1)
    if (checked && wrong.length === 0) {
      nextSentence()
      return
    }
    setChecked(true)
    setPending('')
    if (wrong.length > 0) {
      setSlots(slots.map((s, i) => (wrong.includes(i) ? { token: null } : s)))
      setActive(wrong[0])
    }
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Tab') {
      // Space and Tab both walk to the next blank (wrapping).
      e.preventDefault()
      setPending('')
      setActive(nextOpen(active, slots, true))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
      return
    }
    if (e.key === 'Backspace' && pending === '') {
      // Empty buffer: back a blank; if that blank is filled, remove its word.
      e.preventDefault()
      const canRemove =
        slots[active]?.token !== null && !(checked && rightAt(active))
      if (canRemove) remove(active)
      else if (active > 0) setActive(active - 1)
    }
    // Backspace with text pending falls through: the input drops a letter.
  }

  const score = entry.tokens.filter((_, i) => rightAt(i)).length
  const typed = toneless(pending)

  return (
    <div className="sf">
      {/* invisible, always-focused input that captures every keystroke */}
      <input
        ref={typer}
        className="sf-typer"
        value={pending}
        onChange={(e) => type(e.target.value)}
        onKeyDown={onKey}
        inputMode="text"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="type pinyin"
      />

      {/* top: the whole English sentence (the prompt) */}
      <p className="sf-translation">
        {words.map((word, i) => {
          const good = word.owners.length > 0 && word.owners.every(rightAt)
          const bad = word.owners.length > 0 && word.owners.some((ti) => !rightAt(ti))
          const state = checked ? (bad ? ' bad' : good ? ' good' : '') : ''
          return (
            <span key={i} className={`sf-word${state}`}>
              {word.text}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          )
        })}
      </p>

      {/* middle: the shuffled word bank */}
      <div className="sf-bank">
        {bank.map((j) => {
          const token = entry.tokens[j]
          const used = slots.some((s) => s.token === j)
          const hint = !used && typed !== '' && toneless(token.pinyin).startsWith(typed)
          return (
            <button
              key={`${entry.order}-${j}`}
              type="button"
              className={`sf-chip${used ? ' used' : ''}${hint ? ' hint' : ''}`}
              disabled={used}
              onClick={() => pick(j)}
            >
              <span className="sf-chip-text">{token.text}</span>
              <span className="sf-chip-pinyin">{token.pinyin}</span>
            </button>
          )
        })}
      </div>

      {/* bottom: the fixed blanks */}
      <div className="sf-blanks">
        {entry.tokens.map((_, i) => {
          const slot = slots[i]
          const filled = slot.token !== null ? entry.tokens[slot.token as number] : null
          const state = checked ? (rightAt(i) ? ' good' : ' bad') : ''
          const here = i === active && pending !== '' && slot.token === null
          const isActive = i === active
          return (
            <div className={`sf-slot${state}${isActive ? ' active' : ''}`} key={i}>
              {filled ? (
                <div
                  className="sf-square"
                  role="button"
                  tabIndex={-1}
                  title={t('sentence.remove')}
                  onClick={() => remove(i)}
                >
                  {filled.text}
                </div>
              ) : (
                <div
                  className={`sf-blank${isActive ? ' active' : ''}${
                    here ? ' typing' : ''
                  }`}
                  onClick={() => selectBlank(i)}
                >
                  {here ? (
                    <span className="sf-pending">{pending}</span>
                  ) : isActive ? (
                    <span className="sf-caret" />
                  ) : null}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <footer className="sf-foot">
        <span className="sf-order">#{entry.order}</span>
        {checked ? (
          <>
            <span className="sf-score">
              {score} / {entry.tokens.length}
            </span>
            {score === entry.tokens.length ? (
              <span>
                <kbd>Enter</kbd> {t('sentence.nextEntry')}
              </span>
            ) : (
              <span>
                <kbd>Enter</kbd> {t('sentence.retry')}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="sf-howto">{t('sentence.howto')}</span>
            <span>
              <kbd>Space</kbd>/<kbd>Tab</kbd> {t('sentence.nextBlank')}
            </span>
            <span>
              <kbd>Enter</kbd> {t('sentence.submit')}
            </span>
          </>
        )}
      </footer>
    </div>
  )
}
