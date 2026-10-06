import { useI18n } from '../../i18n'
import { TodayRingWideModule } from './ProgressModules'
import './progressModules.css'

/** A dedicated bench for the Progress "today · ring" card (06) — a single
 *  entry to iterate its UI/UX on, separate from the full module list. */
export default function TodayRingLab() {
  const { t } = useI18n()
  return (
    <div className="pm-list">
      <section className="pm-item">
        <h3 className="pm-item-label">
          {`01 · ${t('progress.mod.todayRingCard')}`}
        </h3>
        <div className="pm-mod-stage">
          <div className="pm-card-mock">
            <TodayRingWideModule />
          </div>
        </div>
      </section>
      <section className="pm-item">
        <h3 className="pm-item-label">
          {`02 · ${t('progress.mod.todayRingPlain')}`}
        </h3>
        <div className="pm-mod-stage">
          <div className="pm-card-mock">
            <TodayRingWideModule dividers={false} />
          </div>
        </div>
      </section>
    </div>
  )
}
