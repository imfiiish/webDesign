import type { CSSProperties } from 'react'
import { useI18n } from '../../i18n'
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
}

type Props = {
  stats: ResultsStats
  onContinue: () => void
  onStop: () => void
}

/** Full-screen round summary for the Flip · Results scene. Words encountered
 *  live in a left rail; the summary and actions sit in the right column. Free
 *  of the app tokens on purpose — it is meant to feel like a reward screen. */
export default function FlipResults({ stats, onContinue, onStop }: Props) {
  const { t } = useI18n()
  const { studied, newWords, reviewWords, exposed, reveals, words } = stats
  const newPct = studied ? Math.round((newWords / studied) * 100) : 0

  return (
    <div className="results">
      <aside className="results-side">
        <h2 className="results-side-title">{t('results.encountered')}</h2>
        <ul className="results-wordlist">
          {words.map((w) => (
            <li key={w.word} className={`rw ${w.kind}`}>
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

        <div className="results-hero">
          <div
            className="results-ring"
            style={{ '--p': newPct } as CSSProperties}
          >
            <div className="results-ring-inner">
              <span className="results-hero-num">{studied}</span>
              <span className="results-hero-label">{t('results.studied')}</span>
            </div>
          </div>
          <div className="results-hero-meta">
            <p className="results-hero-line">
              <strong>{newWords}</strong> {t('results.new')}
              <span className="results-dot">·</span>
              <strong>{reviewWords}</strong> {t('results.review')}
            </p>
            <p className="results-hero-line muted">
              {exposed} {t('results.exposed')}
              <span className="results-dot">·</span>
              {reveals} {t('results.reveals')}
            </p>
          </div>
        </div>

        <div className="results-stats">
          <div className="results-stat new">
            <span className="results-stat-num">{newWords}</span>
            <span className="results-stat-label">{t('results.new')}</span>
          </div>
          <div className="results-stat review">
            <span className="results-stat-num">{reviewWords}</span>
            <span className="results-stat-label">{t('results.review')}</span>
          </div>
          <div className="results-stat exposed">
            <span className="results-stat-num">{exposed}</span>
            <span className="results-stat-label">{t('results.exposed')}</span>
          </div>
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
