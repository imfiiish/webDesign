import { useI18n } from '../../i18n'
import './progressModules.css'

/* ------------------------------------------------------------------ *
 * Progress page module: a month calendar of study activity, sized to
 * live in a right-hand rail.
 * ------------------------------------------------------------------ */

/** Deterministic activity level (0–4) for a given day. */
function levelOf(day: number, month: number): number {
  const x = Math.sin(day * 12.9898 + month * 3.7) * 43758.5453
  const r = x - Math.floor(x)
  return r < 0.24 ? 0 : 1 + Math.floor(r * 4)
}

export function CalendarModule() {
  const { lang } = useI18n()
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US'

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Monday-first column for the 1st of the month
  const firstCol = (new Date(year, month, 1).getDay() + 6) % 7

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1))

  const wdFmt = new Intl.DateTimeFormat(locale, { weekday: 'narrow' })
  // 2024-01-01 is a Monday
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    wdFmt.format(new Date(2024, 0, 1 + i)),
  )

  const cells: (number | null)[] = [
    ...Array.from({ length: firstCol }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="pm-cal">
      <div className="pm-cal-head">
        <button type="button" className="pm-nav" aria-label="previous">
          ‹
        </button>
        <span className="pm-month">{monthLabel}</span>
        <button type="button" className="pm-nav" aria-label="next">
          ›
        </button>
      </div>

      <div className="pm-week" aria-hidden="true">
        {weekdays.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>

      <div className="pm-grid">
        {cells.map((d, i) =>
          d === null ? (
            <span key={i} className="pm-blank" />
          ) : (
            <span
              key={i}
              className={`pm-day l${levelOf(d, month)}${
                d === today ? ' today' : ''
              }${d > today ? ' future' : ''}`}
            >
              {d}
            </span>
          ),
        )}
      </div>
    </div>
  )
}

/** Creative: the calendar module, shown docked in a screen's right rail. */
export default function ProgressModules() {
  return (
    <div className="pm-screen">
      <div className="pm-screen-body" aria-hidden="true">
        <div className="pm-sk pm-sk-title" />
        <div className="pm-sk pm-sk-hero" />
        <div className="pm-sk-row">
          <div className="pm-sk" />
          <div className="pm-sk" />
        </div>
      </div>
      <aside className="pm-screen-rail">
        <CalendarModule />
      </aside>
    </div>
  )
}
