import { useCallback, useEffect, useState } from 'react'
import BackButton from '../../components/BackButton'
import FlipDeck, { type CardData, type Slot } from '../../components/FlipDeck'
import { useDoubleRightClick, useWheelNav } from '../../components/useDeckNav'
import { useStageScale } from '../../components/useStageScale'
import { useI18n } from '../../i18n'
import { shuffled } from '../../utils'
import { WORDS } from '../flip/data'
import './rating.css'

type Rating = 1 | 2 | 3

const UNDO_LIMIT = 3

/** The Rating page: only tests — no revealing. Rate each card 1/2/3 and it
 *  leaves the ring; Ctrl+Z undoes the last few. Appearance + local state. */
export default function RatingPage() {
  const { t } = useI18n()

  const [deck, setDeck] = useState<CardData[]>(() => shuffled(WORDS))
  const [ratings, setRatings] = useState<Record<string, Rating>>({})
  const [undo, setUndo] = useState<string[]>([])
  const [center, setCenter] = useState(0)
  const [skipArmed, setSkipArmed] = useState(false)
  const [stageKey, setStageKey] = useState(0)

  const { stageRef, scale } = useStageScale()

  const remaining = deck.filter((w) => !(w.word in ratings))
  const safeCenter = remaining.length
    ? Math.min(center, remaining.length - 1)
    : 0

  // start a fresh round
  const finish = useCallback(() => {
    setDeck(shuffled(WORDS))
    setRatings({})
    setUndo([])
    setCenter(0)
    setSkipArmed(false)
    setStageKey((k) => k + 1)
  }, [])

  // rate the centered card, it leaves the ring and the next one slides in
  const rate = useCallback(
    (v: Rating) => {
      const w = remaining[safeCenter]
      if (!w) return
      const nextRatings = { ...ratings, [w.word]: v }
      setRatings(nextRatings)
      setUndo((u) => [...u, w.word].slice(-UNDO_LIMIT))
      setSkipArmed(false)
      const newLen = remaining.length - 1
      if (newLen <= 0) {
        finish()
        return
      }
      setCenter((c) => (c >= newLen ? 0 : c))
    },
    [remaining, safeCenter, ratings, finish],
  )

  // Ctrl+Z: restore the last rated word and center on it (up to 3 times)
  const undoLast = useCallback(() => {
    if (undo.length === 0) return
    const w = undo[undo.length - 1]
    const nextUndo = undo.slice(0, -1)
    const nextRatings = { ...ratings }
    delete nextRatings[w]
    setUndo(nextUndo)
    setRatings(nextRatings)
    setSkipArmed(false)
    const newRemaining = deck.filter((x) => !(x.word in nextRatings))
    const idx = newRemaining.findIndex((x) => x.word === w)
    setCenter(idx >= 0 ? idx : 0)
  }, [undo, ratings, deck])

  // move among the remaining cards only
  const go = useCallback(
    (delta: number) => {
      if (remaining.length === 0) return
      setSkipArmed(false)
      setCenter((c) => (c + delta + remaining.length) % remaining.length)
    },
    [remaining.length],
  )

  // skip = finish, two-step (first click arms, second confirms)
  const skipStep = useCallback(() => {
    if (skipArmed) finish()
    else setSkipArmed(true)
  }, [skipArmed, finish])

  // armed state auto-cancels after 2.5s
  useEffect(() => {
    if (!skipArmed) return
    const id = setTimeout(() => setSkipArmed(false), 2500)
    return () => clearTimeout(id)
  }, [skipArmed])

  // wheel navigation
  useWheelNav(go)

  // keyboard: 1 2 3 rate / Ctrl+Z undo / H L arrows / Enter x2 skip
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && k.toLowerCase() === 'z') {
        e.preventDefault()
        undoLast()
        return
      }
      if (k === 'Enter') {
        e.preventDefault()
        if (e.repeat) return
        skipStep()
        return
      }
      setSkipArmed(false)
      if (k === '1' || k === '2' || k === '3') {
        e.preventDefault()
        rate(Number(k) as Rating)
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
  }, [go, rate, undoLast, skipStep])

  // double right-click (outside the center card) = press Enter (two-step skip)
  useDoubleRightClick(skipStep)

  const onCardClick = useCallback(
    (_name: string, slot: Slot) => {
      if (slot === 1 || slot === 'S') go(1)
      else if (slot === -1) go(-1)
    },
    [go],
  )

  return (
    <div className="rating">
      <BackButton />

      <div className="deck-stage" ref={stageRef}>
        <FlipDeck
          deck={remaining}
          center={safeCenter}
          scale={scale}
          stageKey={stageKey}
          onCardClick={onCardClick}
        />
      </div>

      <button
        type="button"
        className={`deck-action rating-skip${skipArmed ? ' armed' : ''}`}
        onClick={skipStep}
        aria-label={skipArmed ? t('rating.skipConfirm') : t('rating.skip')}
        title={skipArmed ? t('rating.skipConfirm') : t('rating.skip')}
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
          <polyline points="6 6 12 12 6 18" />
          <polyline points="13 6 19 12 13 18" />
        </svg>
      </button>

      <div className="hints">
        <div className="quiz-ratings">
          <button
            type="button"
            className="rating-btn r"
            onClick={(e) => {
              e.currentTarget.blur()
              rate(1)
            }}
          >
            <kbd>1</kbd> {t('rating.unknown')}
          </button>
          <button
            type="button"
            className="rating-btn y"
            onClick={(e) => {
              e.currentTarget.blur()
              rate(2)
            }}
          >
            <kbd>2</kbd> {t('rating.fuzzy')}
          </button>
          <button
            type="button"
            className="rating-btn g"
            onClick={(e) => {
              e.currentTarget.blur()
              rate(3)
            }}
          >
            <kbd>3</kbd> {t('rating.known')}
          </button>
        </div>
      </div>
    </div>
  )
}
