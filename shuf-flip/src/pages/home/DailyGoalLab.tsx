import { useState, type ReactNode } from 'react'
import { useI18n } from '../../i18n'
import './dailyGoalLab.css'

type T = (key: string) => string

const PRESETS = [15, 25, 50]
const MIN = 5
const MAX = 200
const TODAY = 12

const clamp = (n: number) =>
  Math.max(MIN, Math.min(MAX, Number.isFinite(n) ? Math.round(n) : MIN))

/** One editable goal value per idea, with a clamped setter and a stepper. */
function useGoal(initial = 25) {
  const [value, setValue] = useState(initial)
  return {
    value,
    set: (n: number) => setValue(clamp(n)),
    bump: (d: number) => setValue((v) => clamp(v + d)),
  }
}

/** Number field that keeps a free-typing draft and clamps on commit. */
function GoalInput({
  value,
  onCommit,
  className,
  ariaLabel,
}: {
  value: number
  onCommit: (n: number) => void
  className?: string
  ariaLabel?: string
}) {
  const [draft, setDraft] = useState(String(value))
  const [seen, setSeen] = useState(value)

  // Keep the draft in step when a preset or stepper moves the value.
  if (value !== seen) {
    setSeen(value)
    setDraft(String(value))
  }

  return (
    <input
      className={className}
      type="number"
      min={MIN}
      max={MAX}
      step={5}
      value={draft}
      aria-label={ariaLabel}
      onChange={(e) => {
        const raw = e.target.value
        setDraft(raw)
        const n = Number(raw)
        if (raw !== '' && n >= MIN && n <= MAX) onCommit(n)
      }}
      onBlur={() => onCommit(Number(draft) || value)}
    />
  )
}

function Idea({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="dg-idea">
      <h3 className="dg-idea-label">{label}</h3>
      <div className="dg-idea-stage">{children}</div>
    </section>
  )
}

/** The ring, filled by today's progress; its centre is whatever is passed in. */
function GaugeRing({
  value,
  children,
}: {
  value: number
  children: ReactNode
}) {
  const R = 52
  const C = 2 * Math.PI * R
  const pct = Math.min(1, TODAY / Math.max(1, value))
  return (
    <div className="dg-gauge">
      <svg viewBox="0 0 132 132" className="dg-gauge-svg" aria-hidden="true">
        <circle className="dg-gauge-track" cx="66" cy="66" r={R} />
        <circle
          className="dg-gauge-arc"
          cx="66"
          cy="66"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
        />
      </svg>
      <div className="dg-gauge-center">{children}</div>
    </div>
  )
}

/** 01 — Stepper: the shipping shape, centred − / value / + and quick presets. */
function IdeaStepper({ t }: { t: T }) {
  const g = useGoal()
  return (
    <div className="dg-stepper">
      <div className="dg-step-row">
        <button
          type="button"
          className="dg-round"
          aria-label={t('settings.goal.less')}
          onClick={() => g.bump(-5)}
        >
          −
        </button>
        <div className="dg-step-field">
          <GoalInput
            value={g.value}
            onCommit={g.set}
            className="dg-step-input"
            ariaLabel={t('settings.goal.title')}
          />
          <span className="dg-unit">{t('settings.goal.unit')}</span>
        </div>
        <button
          type="button"
          className="dg-round"
          aria-label={t('settings.goal.more')}
          onClick={() => g.bump(5)}
        >
          +
        </button>
      </div>
      <div className="dg-presets">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className={`dg-chip${p === g.value ? ' on' : ''}`}
            aria-pressed={p === g.value}
            onClick={() => g.set(p)}
          >
            {p}
          </button>
        ))}
        <span
          className={`dg-chip-ghost${!PRESETS.includes(g.value) ? ' on' : ''}`}
        >
          {t('settings.goal.custom')}
        </span>
      </div>
    </div>
  )
}

/** 02 — Gauge on the left; value, presets and steppers stacked to its right. */
function IdeaGaugeLeft({ t }: { t: T }) {
  const g = useGoal()
  const pct = Math.round((TODAY / Math.max(1, g.value)) * 100)
  return (
    <div className="dg-gside">
      <GaugeRing value={g.value}>
        <b className="dg-gauge-pct">{pct}%</b>
        <span className="dg-gauge-cap">
          {TODAY}/{g.value}
        </span>
      </GaugeRing>
      <div className="dg-gside-body">
        <span className="dg-gside-kicker">{t('settings.goal.title')}</span>

        <div className="dg-gside-value">
          <GoalInput
            value={g.value}
            onCommit={g.set}
            className="dg-gside-input"
            ariaLabel={t('settings.goal.title')}
          />
          <span className="dg-unit">{t('settings.goal.unit')}</span>
          <div className="dg-gside-steps">
            <button
              type="button"
              className="dg-step2"
              aria-label={t('settings.goal.less')}
              onClick={() => g.bump(-5)}
            >
              −
            </button>
            <button
              type="button"
              className="dg-step2"
              aria-label={t('settings.goal.more')}
              onClick={() => g.bump(5)}
            >
              +
            </button>
          </div>
        </div>

        <div
          className="dg-seg"
          role="group"
          aria-label={t('settings.goal.title')}
        >
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              className={`dg-seg-btn${p === g.value ? ' on' : ''}`}
              aria-pressed={p === g.value}
              onClick={() => g.set(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** 03 — Gauge, centred: the value lives in the ring, controls below. */
function IdeaGaugeCenter({ t }: { t: T }) {
  const g = useGoal()
  return (
    <div className="dg-gauge-wrap">
      <GaugeRing value={g.value}>
        <GoalInput
          value={g.value}
          onCommit={g.set}
          className="dg-gauge-input"
          ariaLabel={t('settings.goal.title')}
        />
        <span className="dg-unit">{t('settings.goal.unit')}</span>
      </GaugeRing>
      <div className="dg-gauge-controls">
        <button
          type="button"
          className="dg-round"
          aria-label={t('settings.goal.less')}
          onClick={() => g.bump(-5)}
        >
          −
        </button>
        <div className="dg-presets">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              className={`dg-chip${p === g.value ? ' on' : ''}`}
              aria-pressed={p === g.value}
              onClick={() => g.set(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="dg-round"
          aria-label={t('settings.goal.more')}
          onClick={() => g.bump(5)}
        >
          +
        </button>
      </div>
    </div>
  )
}

/** Creative bench for the daily-goal control. */
export default function DailyGoalLab() {
  const { t } = useI18n()
  return (
    <div className="dg-list">
      <Idea label={`01 · ${t('goal.idea.stepper')}`}>
        <IdeaStepper t={t} />
      </Idea>
      <Idea label={`02 · ${t('goal.idea.gaugeLeft')}`}>
        <IdeaGaugeLeft t={t} />
      </Idea>
      <Idea label={`03 · ${t('goal.idea.gauge')}`}>
        <IdeaGaugeCenter t={t} />
      </Idea>
    </div>
  )
}
