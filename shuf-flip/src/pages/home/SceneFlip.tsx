import { useCallback, useEffect, useRef, useState } from 'react'
import BackButton from '../../components/BackButton'
import Modal from '../../components/Modal'
import FlipDeck, { type CardData, type Slot } from '../../components/FlipDeck'
import { useCopyNotice } from '../../components/useCopyNotice'
import { useDoubleRightClick, useWheelNav } from '../../components/useDeckNav'
import { useStageScale } from '../../components/useStageScale'
import { useI18n } from '../../i18n'
import { shuffled } from '../../utils'
import { WORDS } from '../flip/data'
import '../flip/flip.css'
import './usage.css'

/** Delay before the usage hint rises in (scene appears / new round starts). */
const HELP_DELAY = 150

/** Sink-away duration; keep in sync with the usage-sink animation in usage.css. */
const HELP_CLOSE_MS = 220

/** Scene: a copy of the Flip page, kept separate so scene-only states (a
 *  round-complete dialog, etc.) can be layered on without touching the page.
 *  Currently identical to the page — do not diverge without noting why. */
export default function SceneFlip() {
  const { t } = useI18n()

  const [deck, setDeck] = useState<CardData[]>(WORDS)
  const [center, setCenter] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [revealCounts, setRevealCounts] = useState<Record<string, number>>({})
  const [stageKey, setStageKey] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [closingHelp, setClosingHelp] = useState(false)
  // locked from the moment a hint is triggered until it has fully closed, so
  // the deck cannot be advanced during the rise-in delay
  const [helpLock, setHelpLock] = useState(true)
  const helpLockRef = useRef(true)
  const helpTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const lockHelp = useCallback((locked: boolean) => {
    helpLockRef.current = locked
    setHelpLock(locked)
  }, [])

  // usage hint: rise in shortly after the scene appears
  useEffect(() => {
    helpTimer.current = setTimeout(() => setShowHelp(true), HELP_DELAY)
    return () => {
      clearTimeout(helpTimer.current)
      clearTimeout(closeTimer.current)
    }
  }, [])

  // and again on every new round (lock immediately, then rise fresh)
  const openHelp = useCallback(() => {
    clearTimeout(helpTimer.current)
    clearTimeout(closeTimer.current)
    lockHelp(true)
    setClosingHelp(false)
    setShowHelp(false)
    helpTimer.current = setTimeout(() => setShowHelp(true), HELP_DELAY)
  }, [lockHelp])

  // sink back to the bottom, then unlock
  const closeHelp = useCallback(() => {
    clearTimeout(helpTimer.current)
    clearTimeout(closeTimer.current)
    setClosingHelp(true)
    closeTimer.current = setTimeout(() => {
      setShowHelp(false)
      setClosingHelp(false)
      lockHelp(false)
    }, HELP_CLOSE_MS + 20)
  }, [lockHelp])

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
    openHelp()
  }, [clearCopy, openHelp])

  // wheel: down / right -> next, up / left -> previous (paused while locked)
  useWheelNav(go, !helpLock)

  // keyboard: Space reveal / Enter next round / H L arrows navigate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key
      // while a hint is pending/open the deck keys are blocked; Esc closes it
      if (helpLockRef.current) {
        if (k !== 'Escape') e.preventDefault()
        return
      }
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

  // double right-click (trackpad two-finger double tap), anywhere including
  // the center card
  useDoubleRightClick(nextRound)

  const onCardClick = useCallback(
    (_name: string, slot: Slot) => {
      if (slot === 0) toggleReveal()
      else if (slot === 1 || slot === 'S') go(1)
      else if (slot === -1) go(-1)
    },
    [toggleReveal, go],
  )

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

      {showHelp && (
        <Modal
          onClose={closeHelp}
          ariaLabel={t('scene.howTo')}
          className="usage"
          closing={closingHelp}
        >
          <h2 className="modal-title">{t('scene.howTo')}</h2>
          <ul className="usage-list">
            <li>{t('scene.flipHint1')}</li>
            <li>{t('scene.flipHint2')}</li>
            <li>{t('scene.flipHint3')}</li>
          </ul>
        </Modal>
      )}
    </div>
  )
}
