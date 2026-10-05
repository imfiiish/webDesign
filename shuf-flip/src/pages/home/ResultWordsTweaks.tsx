import type { CSSProperties } from 'react'
import { useI18n } from '../../i18n'
import { LEARNED, MAX } from './resultWordsData'
import './resultWordsTweaks.css'

/** One micro-tweak: a key that maps to CSS, plus its copy. */
type Tweak = { key: string; name: string; cap: string }

const TWEAKS: Tweak[] = [
  { key: 'current', name: 'results.words.tweak.current', cap: 'results.words.tweak.cap.current' },
  { key: 'glow', name: 'results.words.tweak.glow', cap: 'results.words.tweak.cap.glow' },
  { key: 'flat', name: 'results.words.tweak.flat', cap: 'results.words.tweak.cap.flat' },
  { key: 'recessed', name: 'results.words.tweak.recessed', cap: 'results.words.tweak.cap.recessed' },
  { key: 'glass', name: 'results.words.tweak.glass', cap: 'results.words.tweak.cap.glass' },
  { key: 'hard', name: 'results.words.tweak.hard', cap: 'results.words.tweak.cap.hard' },
  { key: 'underline', name: 'results.words.tweak.underline', cap: 'results.words.tweak.cap.underline' },
  { key: 'grow', name: 'results.words.tweak.grow', cap: 'results.words.tweak.cap.grow' },
]

/** The real words-learned card, unchanged in size — only its skin and hover
 *  behaviour differ between variants. */
function Card({ variant }: { variant: string }) {
  const { t } = useI18n()
  return (
    <div className={`wt-card wt-card--${variant}`}>
      <div className="wt-title">
        <span>{t('results.encountered')}</span>
        <b>{LEARNED.length}</b>
      </div>
      <ul className="wt-list">
        {LEARNED.map((d, i) => {
          const pct = d.n / MAX
          return (
            <li
              key={d.w}
              className={d.kind}
              style={
                {
                  '--w': `${pct * 100}%`,
                  '--p': pct,
                  '--d': `${i * 26}ms`,
                } as CSSProperties
              }
            >
              <span className="wt-dot" />
              <span className="wt-word">{d.w}</span>
              <span className="wt-count">×{d.n}</span>
              <span className="wt-fill" aria-hidden="true" />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Creative: the results-page words-learned card, micro-tuned in place. */
export default function ResultWordsTweaks() {
  const { t } = useI18n()
  return (
    <div className="wt-board">
      {TWEAKS.map((tw) => (
        <div className="wt-item" key={tw.key}>
          <div className="wt-head">
            <h3 className="wt-label">{t(tw.name)}</h3>
            <p className="wt-caption">{t(tw.cap)}</p>
          </div>
          <Card variant={tw.key} />
        </div>
      ))}
    </div>
  )
}
