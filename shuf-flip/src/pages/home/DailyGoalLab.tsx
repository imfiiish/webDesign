import { useState, type ReactNode } from 'react'
import { useI18n } from '../../i18n'
import './dailyGoalLab.css'

type T = (key: string) => string

const PRESETS = [5, 10, 20, 30, 50]
const TICKS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]
const MIN = 5
const MAX = 200
const TODAY = 12

const clamp = (n: number) =>
  Math.max(MIN, Math.min(MAX, Number.isFinite(n) ? Math.round(n) : MIN))

/** One editable goal value per idea, with a clamped setter and a stepper. */
function useGoal(initial = 20) {
  const [value, setValue] = useState(initial)
  return {
    value,
    isCustom: !PRESETS.includes(value),
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
        <span className={`dg-chip-ghost${g.isCustom ? ' on' : ''}`}>
          {t('settings.goal.custom')}
        </span>
      </div>
    </div>
  )
}

/** 02 — Chips: one flat row, the custom value typed straight into the last chip. */
function IdeaChips({ t }: { t: T }) {
  const g = useGoal()
  return (
    <div className="dg-chips-wrap">
      <div className="dg-chips">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className={`dg-chip dg-chip-lg${p === g.value ? ' on' : ''}`}
            aria-pressed={p === g.value}
            onClick={() => g.set(p)}
          >
            {p}
          </button>
        ))}
        <label className={`dg-chip-custom${g.isCustom ? ' on' : ''}`}>
          <GoalInput
            value={g.value}
            onCommit={g.set}
            className="dg-chip-input"
            ariaLabel={t('settings.goal.custom')}
          />
          <span className="dg-unit">{t('settings.goal.unit')}</span>
        </label>
      </div>
      <p className="dg-hint">
        {t('settings.goal.today')} · <b>{TODAY}</b> / {g.value}
      </p>
    </div>
  )
}

/** 03 — Gauge: a ring filled by today's progress, goal typed in the middle. */
function IdeaGauge({ t }: { t: T }) {
  const g = useGoal()
  const R = 52
  const C = 2 * Math.PI * R
  const pct = Math.min(1, TODAY / Math.max(1, g.value))
  return (
    <div className="dg-gauge-wrap">
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
        <div className="dg-gauge-center">
          <GoalInput
            value={g.value}
            onCommit={g.set}
            className="dg-gauge-input"
            ariaLabel={t('settings.goal.title')}
          />
          <span className="dg-unit">{t('settings.goal.unit')}</span>
          <span className="dg-gauge-today">
            {t('settings.goal.today')} {TODAY}/{g.value}
          </span>
        </div>
      </div>
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

/** 04 — Ruler: pick on a tick scale, with a typed readout underneath. */
function IdeaRuler({ t }: { t: T }) {
  const g = useGoal()
  return (
    <div className="dg-ruler-wrap">
      <div className="dg-ruler">
        <span className="dg-ruler-track" aria-hidden="true" />
        <div className="dg-ruler-ticks">
          {TICKS.map((v) => {
            const major = v % 10 === 0
            return (
              <button
                key={v}
                type="button"
                className={`dg-tick${major ? ' major' : ''}${
                  v === g.value ? ' on' : ''
                }`}
                aria-label={String(v)}
                onClick={() => g.set(v)}
              >
                <i />
                {major && <em>{v}</em>}
              </button>
            )
          })}
        </div>
      </div>
      <div className="dg-ruler-readout">
        <GoalInput
          value={g.value}
          onCommit={g.set}
          className="dg-ruler-input"
          ariaLabel={t('settings.goal.title')}
        />
        <span className="dg-unit">{t('settings.goal.unit')}</span>
      </div>
    </div>
  )
}

/** Creative bench for the daily-goal control: four ways to pick words / day. */
export default function DailyGoalLab() {
  const { t } = useI18n()
  return (
    <div className="dg-list">
      <Idea label={`01 · ${t('goal.idea.stepper')}`}>
        <IdeaStepper t={t} />
      </Idea>
      <Idea label={`02 · ${t('goal.idea.chips')}`}>
        <IdeaChips t={t} />
      </Idea>
      <Idea label={`03 · ${t('goal.idea.gauge')}`}>
        <IdeaGauge t={t} />
      </Idea>
      <Idea label={`04 · ${t('goal.idea.ruler')}`}>
        <IdeaRuler t={t} />
      </Idea>
    </div>
  )
}
