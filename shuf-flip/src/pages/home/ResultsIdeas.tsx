import type { CSSProperties, ReactNode } from 'react'
import { useI18n } from '../../i18n'
import './resultsIdeas.css'

type T = (key: string) => string

// Sample data shared by the three concepts.
const SAMPLE = {
  studied: 12,
  newWords: 7,
  reviewWords: 5,
  exposed: 9,
  reveals: 18,
}

const SAMPLE_WORDS = [
  'abandon',
  'benevolent',
  'candid',
  'diligent',
  'eloquent',
  'frugal',
  'genuine',
  'humble',
  'lucid',
  'meticulous',
  'resilient',
  'vivid',
]

function Idea({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="idea">
      <h3 className="idea-label">{label}</h3>
      <div className="idea-stage">{children}</div>
    </section>
  )
}

/** 01 — Minimal: light editorial, one huge number, quiet type. */
function IdeaMinimal({ t }: { t: T }) {
  return (
    <div className="idea-minimal">
      <div className="im-head">
        <span className="im-num">{SAMPLE.studied}</span>
        <span className="im-label">{t('results.studied')}</span>
      </div>
      <div className="im-rule" />
      <p className="im-line">
        <b>{SAMPLE.newWords}</b> {t('results.new')}
        <span>·</span>
        <b>{SAMPLE.reviewWords}</b> {t('results.review')}
        <span>·</span>
        {SAMPLE.exposed} {t('results.exposed')}
      </p>
      <div className="im-words">
        {SAMPLE_WORDS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="im-actions">
        <button type="button" className="im-ghost">
          {t('results.stop')}
        </button>
        <button type="button" className="im-primary">
          {t('results.continue')}
        </button>
      </div>
    </div>
  )
}

/** 02 — Dashboard: dark, dense, gauge + tiles + a little bar chart. */
function IdeaDashboard({ t }: { t: T }) {
  const pct = Math.round((SAMPLE.newWords / SAMPLE.studied) * 100)
  const bars = [3, 5, 2, 6, 4, 1, 5, 3, 2, 4, 6, 2]
  return (
    <div className="idea-dashboard">
      <div className="db-head">
        <div>
          <p className="db-kicker">{t('results.kicker')}</p>
          <h3 className="db-title">{t('results.title')}</h3>
        </div>
        <div className="db-streak">
          <span className="db-streak-num">7</span>
          <span className="db-streak-label">{t('results.streak')}</span>
        </div>
      </div>
      <div className="db-grid">
        <div className="db-gauge" style={{ '--p': pct } as CSSProperties}>
          <div className="db-gauge-in">
            <b>{SAMPLE.studied}</b>
            <span>{t('results.studied')}</span>
          </div>
        </div>
        <div className="db-tiles">
          <div className="db-tile new">
            <b>{SAMPLE.newWords}</b>
            <span>{t('results.new')}</span>
          </div>
          <div className="db-tile review">
            <b>{SAMPLE.reviewWords}</b>
            <span>{t('results.review')}</span>
          </div>
          <div className="db-tile exposed">
            <b>{SAMPLE.exposed}</b>
            <span>{t('results.exposed')}</span>
          </div>
          <div className="db-tile reveals">
            <b>{SAMPLE.reveals}</b>
            <span>{t('results.reveals')}</span>
          </div>
        </div>
        <div className="db-chart">
          <span className="db-chart-label">{t('results.reveals')}</span>
          <div className="db-bars">
            {bars.map((b, i) => (
              <span key={i} style={{ height: `${b * 15}%` }} />
            ))}
          </div>
        </div>
      </div>
      <div className="db-actions">
        <button type="button" className="db-ghost">
          {t('results.stop')}
        </button>
        <button type="button" className="db-primary">
          {t('results.continue')}
        </button>
      </div>
    </div>
  )
}

/** 03 — Celebration: warm gradient, confetti, a daily-goal bar, big buttons. */
function IdeaCelebration({ t }: { t: T }) {
  const goal = 15
  const pct = Math.min(100, Math.round((SAMPLE.studied / goal) * 100))
  return (
    <div className="idea-celebration">
      <div className="ce-confetti" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className={`ce-piece ce-piece-${i % 6}`}
            style={{
              left: `${(i * 6.3 + 3) % 94}%`,
              animationDelay: `${(i * 0.27) % 3.2}s`,
            }}
          />
        ))}
      </div>
      <p className="ce-kicker">{t('results.kicker')}</p>
      <h3 className="ce-title">{t('results.title')}</h3>
      <p className="ce-sub">
        {SAMPLE.newWords} {t('results.new')} · {SAMPLE.reviewWords}{' '}
        {t('results.review')}
      </p>
      <div className="ce-goal">
        <div className="ce-goal-top">
          <span>{t('results.dailyGoal')}</span>
          <span>
            {SAMPLE.studied}/{goal}
          </span>
        </div>
        <div className="ce-bar">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="ce-actions">
        <button type="button" className="ce-ghost">
          {t('results.stop')}
        </button>
        <button type="button" className="ce-primary">
          {t('results.continue')}
        </button>
      </div>
    </div>
  )
}

/** 04 — Timeline: the round as a trail; node size = repeat reveals. */
function IdeaTimeline({ t }: { t: T }) {
  const nodes = SAMPLE_WORDS.slice(0, 6).map((w, i) => ({
    w,
    kind: i % 3 === 0 ? 'review' : 'new',
    n: (i % 3) + 1,
  }))
  return (
    <div className="idea-timeline">
      <div className="tl-head">
        <p className="tl-kicker">{t('results.kicker')}</p>
        <h3 className="tl-title">{t('results.trail')}</h3>
      </div>
      <div className="tl-track">
        <span className="tl-line" aria-hidden="true" />
        {nodes.map((n) => (
          <div className={`tl-node ${n.kind}`} key={n.w}>
            <span className="tl-slot">
              <span className="tl-dot" style={{ '--n': n.n } as CSSProperties}>
                {n.n}
              </span>
            </span>
            <span className="tl-word">{n.w}</span>
          </div>
        ))}
      </div>
      <p className="tl-summary">
        {SAMPLE.newWords} {t('results.new')} · {SAMPLE.reviewWords}{' '}
        {t('results.review')} · {SAMPLE.reveals} {t('results.reveals')}
      </p>
      <div className="tl-actions">
        <button type="button" className="tl-ghost">
          {t('results.stop')}
        </button>
        <button type="button" className="tl-primary">
          {t('results.continue')}
        </button>
      </div>
    </div>
  )
}

/** 05 — Leaderboard: words ranked by how often they were revealed. */
function IdeaLeaderboard({ t }: { t: T }) {
  const rows = [
    { w: 'meticulous', n: 4 },
    { w: 'benevolent', n: 3 },
    { w: 'resilient', n: 3 },
    { w: 'eloquent', n: 2 },
    { w: 'candid', n: 2 },
    { w: 'frugal', n: 1 },
  ]
  const max = 4
  return (
    <div className="idea-leaderboard">
      <div className="lb-head">
        <p className="lb-kicker">{t('results.kicker')}</p>
        <h3 className="lb-title">{t('results.ranking')}</h3>
      </div>
      <ol className="lb-list">
        {rows.map((r, i) => (
          <li className="lb-row" key={r.w}>
            <span className={`lb-rank r${i + 1}`}>{i + 1}</span>
            <span className="lb-word">{r.w}</span>
            <span className="lb-bar">
              <i style={{ width: `${(r.n / max) * 100}%` }} />
            </span>
            <span className="lb-count">×{r.n}</span>
          </li>
        ))}
      </ol>
      <div className="lb-actions">
        <button type="button" className="lb-ghost">
          {t('results.stop')}
        </button>
        <button type="button" className="lb-primary">
          {t('results.continue')}
        </button>
      </div>
    </div>
  )
}

/** 06 — Poster: a shareable card with the hero number and a stat strip. */
function IdeaPoster({ t }: { t: T }) {
  return (
    <div className="idea-poster">
      <div className="ps-card">
        <span className="ps-dots" aria-hidden="true" />
        <p className="ps-kicker">{t('results.kicker')}</p>
        <div className="ps-big">{SAMPLE.studied}</div>
        <p className="ps-label">{t('results.studied')}</p>
        <div className="ps-grid">
          <div>
            <b>{SAMPLE.newWords}</b>
            <span>{t('results.new')}</span>
          </div>
          <div>
            <b>{SAMPLE.reviewWords}</b>
            <span>{t('results.review')}</span>
          </div>
          <div>
            <b>{SAMPLE.exposed}</b>
            <span>{t('results.exposed')}</span>
          </div>
          <div>
            <b>{SAMPLE.reveals}</b>
            <span>{t('results.reveals')}</span>
          </div>
        </div>
      </div>
      <div className="ps-actions">
        <button type="button" className="ps-ghost">
          {t('results.stop')}
        </button>
        <button type="button" className="ps-primary">
          {t('results.continue')}
        </button>
      </div>
    </div>
  )
}

/** Creative: six takes on the round-result screen. */
export default function ResultsIdeas() {
  const { t } = useI18n()
  return (
    <div className="ideas">
      <Idea label={`01 · ${t('results.idea.minimal')}`}>
        <IdeaMinimal t={t} />
      </Idea>
      <Idea label={`02 · ${t('results.idea.dashboard')}`}>
        <IdeaDashboard t={t} />
      </Idea>
      <Idea label={`03 · ${t('results.idea.celebration')}`}>
        <IdeaCelebration t={t} />
      </Idea>
      <Idea label={`04 · ${t('results.idea.timeline')}`}>
        <IdeaTimeline t={t} />
      </Idea>
      <Idea label={`05 · ${t('results.idea.ranking')}`}>
        <IdeaLeaderboard t={t} />
      </Idea>
      <Idea label={`06 · ${t('results.idea.poster')}`}>
        <IdeaPoster t={t} />
      </Idea>
    </div>
  )
}
