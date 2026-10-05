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

  // words that reached the centre this round (exposure, once each)
  const centeredRef = useRef<Set<string>>(new Set())

  const { copied, copy, clear: clearCopy } = useCopyNotice()
  const { stageRef, scale } = useStageScale()
  const TOTAL = deck.length
  const centerName = deck[center]?.word ?? null
  const showResults = stats !== null

  // record exposure as the centre moves
  useEffect(() => {
    const w = deck[center]?.word
    if (w) centeredRef.current.add(w)
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

  // build a plausible summary from the round (real words, demo numbers)
  const makeStats = useCallback((): ResultsStats => {
    const map = new Map<string, ResultsWord>()
    const add = (word: string, count: number) => {
      if (!word || map.has(word)) return
      map.set(word, {
        word,
        count,
        kind: Math.random() < 0.58 ? 'new' : 'review',
      })
    }
    // words that reached the centre = encountered (exposure; count 0 = seen only)
    for (const word of centeredRef.current) add(word, revealCounts[word] ?? 0)
    // revealed words, in case any were missed
    for (const [word, count] of Object.entries(revealCounts)) add(word, count)
    // pad the rail so it does not look empty
    const pool = WORDS.map((w) => w.word)
    while (map.size < 12) {
      const word = pool[Math.floor(Math.random() * pool.length)]
      const count = Math.random() < 0.7 ? 1 + Math.floor(Math.random() * 3) : 0
      add(word, count)
    }

    const words = [...map.values()].slice(0, 16)
    const studied = words.filter((w) => w.count > 0).length
    const newWords = words.filter((w) => w.count > 0 && w.kind === 'new').length
    const reviewWords = studied - newWords
    const exposed = words.filter((w) => w.count === 0).length
    const reveals = words.reduce((n, w) => n + w.count, 0)
    return { studied, newWords, reviewWords, exposed, reveals, words }
  }, [revealCounts])

  // finish the round -> full-screen summary
  const finishRound = useCallback(() => {
    if (showResults) return
    setRevealed(false)
    setStats(makeStats())
  }, [showResults, makeStats])

  // continue -> reshuffle a fresh round
  const continueRound = useCallback(() => {
    setDeck(shuffled(WORDS))
    setCenter(0)
    setRevealed(false)
    setRevealCounts({})
    setStageKey((k) => k + 1)
    clearCopy()
    centeredRef.current.clear()
    setStats(null)
  }, [clearCopy])

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
