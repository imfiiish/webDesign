import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n'
import FlipDeck, { type Slot } from './FlipDeck'
import { useStageScale } from './useStageScale'
import { WORDS } from './data'
import './flip.css'

const ALL_WORDS = WORDS.map((w) => w.word)

function shuffled(list: string[]): string[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** The Flip page: a ring of cards you shuffle, reveal and flip through.
 *  Appearance + local interaction only (no audio, no progress, no sync). */
export default function Flip() {
  const navigate = useNavigate()
  const { t } = useI18n()

  const [deck, setDeck] = useState<string[]>(ALL_WORDS)
  const [center, setCenter] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [revealCounts, setRevealCounts] = useState<Record<string, number>>({})
  const [copyNotice, setCopyNotice] = useState<string | null>(null)
  const [stageKey, setStageKey] = useState(0)

  const copyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  const { stageRef, scale } = useStageScale()
  const TOTAL = deck.length
  const centerName = deck[center] ?? null

  const clearCopy = useCallback(() => {
    window.clearTimeout(copyTimer.current)
    setCopyNotice(null)
  }, [])

  const go = useCallback(
    (delta: number) => {
      if (!TOTAL) return
      setRevealed(false)
      clearCopy()
      setCenter((c) => (c + delta + TOTAL) % TOTAL)
    },
    [TOTAL, clearCopy],
  )

  const reveal = useCallback(() => {
    setRevealed(true)
    const name = deck[center]
    if (name) setRevealCounts((c) => ({ ...c, [name]: (c[name] || 0) + 1 }))
  }, [deck, center])

  // reveal / flip back (no audio to replay, so a second click hides it)
  const toggleReveal = useCallback(() => {
    if (revealed) setRevealed(false)
    else reveal()
  }, [revealed, reveal])

  const copyCurrent = useCallback(() => {
    if (!centerName) return
    void navigator.clipboard?.writeText(centerName).then(
      () => {
        window.clearTimeout(copyTimer.current)
        setCopyNotice(t('flip.copied'))
        copyTimer.current = window.setTimeout(() => setCopyNotice(null), 1000)
      },
      () => {},
    )
  }, [centerName, t])

  const nextRound = useCallback(() => {
    setDeck(shuffled(ALL_WORDS))
    setCenter(0)
    setRevealed(false)
    clearCopy()
    setStageKey((k) => k + 1)
  }, [clearCopy])

  // wheel: down / right -> next, up / left -> previous
  useEffect(() => {
    let acc = 0
    let last = 0
    let idle: ReturnType<typeof setTimeout> | undefined
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return
      e.preventDefault()
      const unit =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
      const raw = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      acc += raw * unit
      clearTimeout(idle)
      idle = setTimeout(() => {
        acc = 0
      }, 150)
      if (Math.abs(acc) < 24) return
      const now = performance.now()
      if (now - last < 120) return
      const dir = acc > 0 ? 1 : -1
      acc = 0
      last = now
      go(dir)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      clearTimeout(idle)
      window.removeEventListener('wheel', onWheel)
    }
  }, [go])

  // keyboard: Space reveal / Enter next round / H L arrows navigate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && k.toLowerCase() === 'c') {
        e.preventDefault()
        copyCurrent()
        return
      }
      if (k === ' ') {
        e.preventDefault()
        if (e.repeat) return
        toggleReveal()
        return
      }
      if (k === 'Enter') {
        e.preventDefault()
        if (e.repeat) return
        nextRound()
        return
      }
      const low = k.toLowerCase()
      if (low === 'h' || k === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      } else if (low === 'l' || k === 'ArrowRight') {
        e.preventDefault()
        go(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, toggleReveal, nextRound, copyCurrent])

  // double right-click (trackpad two-finger double tap) outside the center card
  useEffect(() => {
    let last = 0
    const onCtx = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target : null
      if (target?.closest('.card.active')) {
        last = 0
        return
      }
      e.preventDefault()
      const now = performance.now()
      if (last !== 0 && now - last <= 400) {
        last = 0
        nextRound()
      } else {
        last = now
      }
    }
    window.addEventListener('contextmenu', onCtx)
    return () => window.removeEventListener('contextmenu', onCtx)
  }, [nextRound])

  const onCardClick = (_name: string, slot: Slot) => {
    if (slot === 0) toggleReveal()
    else if (slot === 1 || slot === 'S') go(1)
    else if (slot === -1) go(-1)
  }

  return (
    <div className="flip">
      <button
        type="button"
        className="flip-home"
        onClick={() => navigate('/')}
        aria-label={t('flip.back')}
        title={t('flip.back')}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <div className="flip-stage" ref={stageRef}>
        <FlipDeck
          deck={deck}
          center={center}
          revealed={revealed}
          centerNotice={copyNotice}
          revealCounts={revealCounts}
          scale={scale}
          stageKey={stageKey}
          onCardClick={onCardClick}
          onCardContextMenu={copyCurrent}
        />
      </div>

      <button
        type="button"
        className="flip-next"
        onClick={nextRound}
        aria-label={t('flip.next')}
        title={t('flip.next')}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>

      <div className="hints">
        <span>
          <kbd>Space</kbd> {revealed ? t('flip.replay') : t('flip.reveal')}
        </span>
        <span>
          <kbd>Enter</kbd> {t('flip.next')}
        </span>
      </div>
    </div>
  )
}
