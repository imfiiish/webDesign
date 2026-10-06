import { useState } from 'react'
import BackButton from '../../components/BackButton'
import { useI18n } from '../../i18n'
import { Dual, GoalGauge, PieExplode } from '../home/ResultCharts'
import { Sunburst } from '../home/ProgressCharts'
import {
  CalendarModule,
  TodayRingWideModule,
} from '../home/ProgressModules'
import { DIMS, type DimKey } from './data'
import './progress.css'

const ORDER: DimKey[] = ['day', 'month']

/** Progress page — the charts, read at day / week / month / total zoom. */
export default function Progress() {
  const { t } = useI18n()
  const [dim, setDim] = useState<DimKey>('day')
  const d = DIMS[dim]
  const deck = Math.max(1, ...d.rounds.map((r) => r.e))

  return (
    <div className="progress-page">
      <BackButton />
      <header className="progress-head">
        <div>
          <h1 className="progress-title">{t('progress.title')}</h1>
          <p className="progress-desc">{t('progress.desc')}</p>
        </div>
        <div className="progress-tabs" role="tablist">
          {ORDER.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={dim === k}
              className={`progress-tab${dim === k ? ' on' : ''}`}
              onClick={() => setDim(k)}
            >
              {t(DIMS[k].label)}
            </button>
          ))}
        </div>
      </header>

      <div className="progress-body">
        <main className="progress-main">
          <div className="progress-grid">
            {/* the pie only reads at the day zoom; today's numbers ride
                along on the same row */}
            {dim === 'day' && d.pie && (
              <section className="progress-card">
                <PieExplode
                  newWords={d.pie.newWords}
                  reviewWords={d.pie.reviewWords}
                  exposed={d.pie.exposed}
                  legend={false}
                />
              </section>
            )}

            {dim === 'day' && (
              <section className="progress-card">
                <TodayRingWideModule />
              </section>
            )}

            <section className="progress-card progress-card-wide">
              {dim === 'day' ? (
                <Dual rounds={d.rounds} deck={deck} />
              ) : (
                <Dual
                  rounds={d.rounds}
                  deck={deck}
                  tone="study"
                  scale="shared"
                  headlineLabel="progress.totalWords"
                  headlineValue="sum"
                  labels={{
                    e: t('results.review'),
                    r: t('results.new'),
                    cumE: t('progress.cumReview'),
                    cumR: t('progress.cumNew'),
                  }}
                />
              )}
            </section>
          </div>
        </main>

        <aside className="progress-rail">
          <CalendarModule />
          {dim !== 'day' && (
            <section className="progress-card">
              <Sunburst burst={d.burst} legend={false} />
            </section>
          )}
          {dim === 'day' && d.gauge && (
            <section className="progress-card">
              <GoalGauge value={d.gauge.value} goal={d.gauge.goal} />
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
