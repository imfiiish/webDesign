import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../../components/BackButton'
import FlipDeck, { type CardData, type Slot } from '../../components/FlipDeck'
import { useCopyNotice } from '../../components/useCopyNotice'
import { useDoubleRightClick, useWheelNav } from '../../components/useDeckNav'
import { useStageScale } from '../../components/useStageScale'
import { useI18n } from '../../i18n'
import { shuffled } from '../../utils'
import { WORDS } from '../flip/data'
import FlipResults, { type ResultsStats, type ResultsWord } from './FlipResults'
import '../flip/flip.css'

/** Reveal counts that auto-open the summary (distinct words revealed). */
const MILESTONES = [5, 20]

/** Stable new/review tag (no history here, so derive it from the word). */
function kindOf(word: string): 'new' | 'review' {
  let h = 0
  for (let i = 0; i < word.length; i++) h = (h * 31 + word.charCodeAt(i)) >>> 0
  return h % 100 < 62 ? 'new' : 'review'
}

/** Scene: the Flip page plus a full-screen round summary. Data is demo —
 *  centered = exposure (once per round), revealed = review (repeat counts). */
export default function SceneFlipResults() {
  const { t } = useI18n()
  const navigate = useNavigate()

  const [deck, setDeck] = useState<CardData[]>(WORDS)
  const [center, setCenter] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [revealCounts, setRevealCounts] = useState<Record<string, number>>({})
  const [stageKey, setStageKey] = useState(0)
  const [stats, setStats] = useState<ResultsStats | null>(null)
  // milestones already consumed by opening the summary
  const [shownMilestones, setShownMilestones] = useState<number[]>([])
  // banked per-round tallies (e = cards exposed, r = reveals)
  const [roundHistory, setRoundHistory] = useState<
    { e: number; r: number }[]
  >([])

  // words that reached the centre this round (exposure, once each)
  const centeredRef = useRef<Set<string>>(new Set())
  // per-round tallies, reset whenever a fresh round starts
  const roundCenteredRef = useRef<Set<string>>(new Set())
  const roundRevealsRef = useRef(0)

  const { copied, copy, clear: clearCopy } = useCopyNotice()
  const { stageRef, scale } = useStageScale()
  const TOTAL = deck.length
  const centerName = deck[center]?.word ?? null
  const showResults = stats !== null
  const revealedCount = Object.keys(revealCounts).length
  const nextMilestone = MILESTONES.find((m) => !shownMilestones.includes(m))
  const canFinish =
    nextMilestone !== undefined && revealedCount >= nextMilestone

  // record exposure as the centre moves
  useEffect(() => {
    const w = deck[center]?.word
    if (w) {
      centeredRef.current.add(w)
      roundCenteredRef.current.add(w)
    }
  }, [deck, center])

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
    roundRevealsRef.current += 1
    const name = deck[center]?.word
    if (name) setRevealCounts((c) => ({ ...c, [name]: (c[name] || 0) + 1 }))
  }, [deck, center])

  const toggleReveal = useCallback(() => {
    if (revealed) setRevealed(false)
    else reveal()
  }, [revealed, reveal])

  const copyCurrent = useCallback(() => {
    if (centerName) copy(centerName)
  }, [centerName, copy])

  // real summary from the session — only revealed words count as learned
  const computeStats = useCallback((): ResultsStats => {
    const words: ResultsWord[] = Object.entries(revealCounts).map(
      ([word, count]) => ({ word, count, kind: kindOf(word) }),
    )
    const revealed = new Set(words.map((w) => w.word))
    const studied = words.length
    const newWords = words.filter((w) => w.kind === 'new').length
    const reviewWords = studied - newWords
    const reveals = words.reduce((n, w) => n + w.count, 0)
    // exposed = reached the centre but never revealed
    let exposed = 0
    for (const word of centeredRef.current) if (!revealed.has(word)) exposed += 1
    // the round in progress plus the ones already banked
    const rounds = [
      ...roundHistory,
      { e: roundCenteredRef.current.size, r: roundRevealsRef.current },
    ]
    return {
      studied,
      newWords,
      reviewWords,
      exposed,
      reveals,
      words,
      rounds,
      deck: WORDS.length,
    }
  }, [revealCounts, roundHistory])

  // Enter opens the summary, but only once the reveal count has reached the
  // next milestone (5, then 20)
  // a fresh shuffle; the session (and milestone counts) carry on
  const newRound = useCallback(() => {
    // snapshot the round that just ended, then reset its tallies (the state
    // updater would otherwise read the refs after they are cleared)
    const done = {
      e: roundCenteredRef.current.size,
      r: roundRevealsRef.current,
    }
    setRoundHistory((h) => [...h, done])
    roundCenteredRef.current = new Set()
    roundRevealsRef.current = 0
    setDeck(shuffled(WORDS))
    setCenter(0)
    setRevealed(false)
    setStageKey((k) => k + 1)
    clearCopy()
  }, [clearCopy])

  // Enter / action: before the first milestone it starts a new round; once the
  // next milestone is reached it opens the summary.
  const finishRound = useCallback(() => {
    if (showResults) return
    const revealed = Object.keys(revealCounts).length
    const next = MILESTONES.find((m) => !shownMilestones.includes(m))
    if (next !== undefined && revealed < next) {
      newRound()
      return
    }
    setShownMilestones((prev) => {
      const set = new Set(prev)
      for (const m of MILESTONES) if (revealed >= m) set.add(m)
      return [...set]
    })
    setRevealed(false)
    setStats(computeStats())
  }, [showResults, revealCounts, shownMilestones, computeStats, newRound])

  const continueRound = useCallback(() => {
    newRound()
    setStats(null)
  }, [newRound])

  const stopSession = useCallback(() => navigate('/'), [navigate])

  // wheel: down / right -> next, up / left -> previous (paused on the summary)
  useWheelNav(go, !showResults)

  // keyboard: Space reveal / Enter summary / H L arrows navigate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showResults) {
        e.preventDefault()
        return
      }
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
        finishRound()
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
  }, [go, toggleReveal, finishRound, copyCurrent, showResults])

  // double right-click (trackpad two-finger double tap) ends the round
  useDoubleRightClick(finishRound)

  const onCardClick = useCallback(
    (_name: string, slot: Slot) => {
      if (slot === 0) toggleReveal()
      else if (slot === 1 || slot === 'S') go(1)
      else if (slot === -1) go(-1)
    },
    [toggleReveal, go],
  )

  return (
    <div className="flip scene-results">
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
        onClick={finishRound}
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

      {canFinish && !showResults && (
        <button type="button" className="flip-finish" onClick={finishRound}>
          {t('results.break')}
        </button>
      )}

      {stats && (
        <FlipResults
          stats={stats}
          onContinue={continueRound}
          onStop={stopSession}
        />
      )}
    </div>
  )
}
