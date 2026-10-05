import type { CSSProperties } from 'react'
import { useI18n } from '../../i18n'
import { Dual, GoalGauge, PieExplode } from './ResultCharts'
import './flipResults.css'

export type ResultsWord = {
  word: string
  count: number
  kind: 'new' | 'review'
}

export type ResultsStats = {
  studied: number
  newWords: number
  reviewWords: number
  exposed: number
  reveals: number
  words: ResultsWord[]
  /** One entry per round: e = cards exposed, r = reveals. */
  rounds: { e: number; r: number }[]
  /** Cards in a round — the exposure ceiling. */
  deck: number
}

type Props = {
  stats: ResultsStats
  onContinue: () => void
  onStop: () => void
}

/** Daily target the goal gauge measures against. */
const DAILY_GOAL = 15

/** Full-screen round summary for the Flip · Results scene. Words encountered
 *  live in a left rail; the summary reads as a small report — a composition
 *  halo, a daily-goal gauge and the round's reveal pace. Free of the app
 *  tokens on purpose — it is meant to feel like a reward screen. */
export default function FlipResults({ stats, onContinue, onStop }: Props) {
  const { t } = useI18n()
  const { studied, newWords, reviewWords, exposed, words, rounds, deck } =
    stats

  // left rail doubles as a bar chart: sorted, with a proportional fill
  const maxCount = Math.max(1, ...words.map((w) => w.count))
  const rail = [...words].sort(
    (a, b) => b.count - a.count || a.word.localeCompare(b.word),
  )

  return (
    <div className="results">
      <aside className="results-side">
        <h2 className="results-side-title">
          {t('results.encountered')}
          <span className="results-side-count">{studied}</span>
        </h2>
        <ul className="results-wordlist">
          {rail.map((w, i) => (
            <li
              key={w.word}
              className={`rw ${w.kind}`}
              style={
                {
                  '--w': `${(w.count / maxCount) * 100}%`,
                  '--d': `${Math.min(i, 14) * 26}ms`,
                } as CSSProperties
              }
            >
              <span className="rw-dot" aria-hidden="true" />
              <span className="rw-word">{w.word}</span>
              <span className="rw-count">×{w.count}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="results-main">
        <p className="results-kicker">{t('results.kicker')}</p>
        <h1 className="results-title">{t('results.title')}</h1>

        <div className="results-dashboard">
          <section className="results-panel results-panel-halo">
            <PieExplode
              newWords={newWords}
              reviewWords={reviewWords}
              exposed={exposed}
            />
          </section>
          <section className="results-panel results-panel-gauge">
            <GoalGauge value={studied} goal={DAILY_GOAL} />
          </section>
          <section className="results-panel results-panel-dual">
            <Dual rounds={rounds} deck={deck} />
          </section>
        </div>

        <div className="results-actions">
          <button type="button" className="results-btn ghost" onClick={onStop}>
            {t('results.stop')}
          </button>
          <button
            type="button"
            className="results-btn primary"
            onClick={onContinue}
          >
            {t('results.continue')}
          </button>
        </div>
      </main>
    </div>
  )
}
