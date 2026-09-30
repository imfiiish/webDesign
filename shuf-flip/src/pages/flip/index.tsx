import { useCallback, useEffect, useState } from 'react'
import BackButton from '../../components/BackButton'
import FlipDeck, { type CardData, type Slot } from '../../components/FlipDeck'
import { useCopyNotice } from '../../components/useCopyNotice'
import { useDoubleRightClick, useWheelNav } from '../../components/useDeckNav'
import { useStageScale } from '../../components/useStageScale'
import { useI18n } from '../../i18n'
import { shuffled } from '../../utils'
import { WORDS } from './data'
import './flip.css'

/** The Flip page: a ring of cards you shuffle, reveal and flip through.
 *  Appearance + local interaction only (no audio, no progress, no sync). */
export default function Flip() {
  const { t } = useI18n()

  const [deck, setDeck] = useState<CardData[]>(WORDS)
  const [center, setCenter] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [revealCounts, setRevealCounts] = useState<Record<string, number>>({})
  const [stageKey, setStageKey] = useState(0)

  const { copied, copy, clear: clearCopy } = useCopyNotice()

  const { stageRef, scale } = useStageScale()
  const TOTAL = deck.length
  const centerName = deck[center]?.word ?? null

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
    const name = deck[center]?.word
    if (name) setRevealCounts((c) => ({ ...c, [name]: (c[name] || 0) + 1 }))
  }, [deck, center])

  // reveal / flip back (no audio to replay, so a second click hides it)
  const toggleReveal = useCallback(() => {
    if (revealed) setRevealed(false)
    else reveal()
  }, [revealed, reveal])

  const copyCurrent = useCallback(() => {
    if (centerName) copy(centerName)
  }, [centerName, copy])

  const nextRound = useCallback(() => {
    setDeck(shuffled(WORDS))
    setCenter(0)
    setRevealed(false)
    clearCopy()
    setStageKey((k) => k + 1)
  }, [clearCopy])

  // wheel: down / right -> next, up / left -> previous
  useWheelNav(go)

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
  useDoubleRightClick(nextRound)

  const onCardClick = (_name: string, slot: Slot) => {
    if (slot === 0) toggleReveal()
    else if (slot === 1 || slot === 'S') go(1)
    else if (slot === -1) go(-1)
  }

  return (
    <div className="flip">
      <BackButton />

      <div className="deck-stage" ref={stageRef}>
        <FlipDeck
          deck={deck}
          center={center}
          revealed={revealed}
          centerNotice={copied ? t('common.copied') : null}
          revealCounts={revealCounts}
          scale={scale}
          stageKey={stageKey}
          onCardClick={onCardClick}
          onCardContextMenu={copyCurrent}
        />
      </div>

      <button
        type="button"
        className="deck-action"
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
