import { useState, type ReactNode } from 'react'
import { useI18n } from '../../i18n'
import { TodayRingLiveModule } from './ProgressModules'
import './progressModules.css'

/** A ring concept with the replay button in its title row, matching the
 *  Results · charts gallery. The stage is keyed so replay remounts it. */
function LabItem({
  label,
  children,
}: {
  label: string
  children: (run: number) => ReactNode
}) {
  const { t } = useI18n()
  const [run, setRun] = useState(0)
  return (
    <section className="pm-item">
      <div className="pm-item-head">
        <h3 className="pm-item-label">{label}</h3>
        <button
          type="button"
          className="pm-play"
          onClick={() => setRun((r) => r + 1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
          {t('progress.replay')}
        </button>
      </div>
      <div className="pm-mod-stage" key={run}>
        {children(run)}
      </div>
    </section>
  )
}

/** A dedicated bench for the Progress "today · ring" card — the live take,
 *  with its own replay. */
export default function TodayRingLab() {
  const { t } = useI18n()
  return (
    <div className="pm-list">
      <LabItem label={`01 · ${t('progress.mod.todayRingLiveEnter')}`}>
        {(run) => (
          <div className="pm-card-mock">
            <TodayRingLiveModule dividers={false} run={run} enterCounts />
          </div>
        )}
      </LabItem>
    </div>
  )
}
