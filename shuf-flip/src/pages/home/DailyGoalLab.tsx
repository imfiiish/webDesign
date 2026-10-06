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

/** One goal value per idea, with a clamped setter and a stepper. */
function useGoal(initial = 25) {
  const [value, setValue] = useState(initial)
  return {
    value,
    set: (n: number) => setValue(clamp(n)),
    bump: (d: number) => setValue((v) => clamp(v + d)),
  }
}

/** A round step button, shared so the ideas move the same way. */
function StepButton({
  dir,
  label,
  onClick,
  small,
}: {
  dir: 'less' | 'more'
  label: string
  onClick: () => void
  small?: boolean
}) {
  return (
    <button
      type="button"
      className={`dg-round${small ? ' dg-round-sm' : ''}`}
      aria-label={label}
      onClick={onClick}
    >
      {dir === 'less' ? '\u2212' : '+'}
    </button>
  )
}

/** Two steps joined into one pill — a calmer stepper for the settings take. */
function StepGroup({
  lessLabel,
  moreLabel,
  onLess,
  onMore,
}: {
  lessLabel: string
  moreLabel: string
  onLess: () => void
  onMore: () => void
}) {
  return (
    <div className="dg-stepgroup" role="group">
      <button
        type="button"
        className="dg-stepgroup-btn"
        aria-label={lessLabel}
        onClick={onLess}
      >
        {'\u2212'}
      </button>
      <span className="dg-stepgroup-sep" aria-hidden="true" />
      <button
        type="button"
        className="dg-stepgroup-btn"
        aria-label={moreLabel}
        onClick={onMore}
      >
        +
      </button>
    </div>
  )
}

/** The three quick goals, worn as a segmented control by two of the ideas. */
function Presets({
  value,
  onPick,
  wide,
}: {
  value: number
  onPick: (n: number) => void
  wide?: boolean
}) {
  return (
    <div
      className={`dg-seg${wide ? ' dg-seg-wide' : ''}`}
      role="group"
      aria-label="presets"
    >
      {PRESETS.map((p) => (
        <button
          key={p}
          type="button"
          className={`dg-seg-btn${p === value ? ' on' : ''}`}
          aria-pressed={p === value}
          onClick={() => onPick(p)}
        >
          {p}
        </button>
      ))}
    </div>
  )
}

/** One row of the bench: a caption above a stage the idea sits in. */
function Idea({
  no,
  label,
  wide,
  children,
}: {
  no: string
  label: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <section className={`dg-idea${wide ? ' dg-idea-wide' : ''}`}>
      <header className="dg-idea-head">
        <span className="dg-idea-no">{no}</span>
        <h3 className="dg-idea-label">{label}</h3>
      </header>
      <div className="dg-stage">{children}</div>
    </section>
  )
}

/** The progress ring. The track is the goal, the arc is how far today has
 *  come; the middle is whatever the idea wants to say. */
function Ring({
  value,
  size = 188,
  children,
}: {
  value: number
  size?: number
  children: ReactNode
}) {
  const R = 54
  const C = 2 * Math.PI * R
  const pct = Math.min(1, TODAY / Math.max(1, value))
  return (
    <div className="dg-ring" style={{ width: size, height: size }}>
      <span className="dg-ring-glow" aria-hidden="true" />
      <svg viewBox="0 0 132 132" className="dg-ring-svg" aria-hidden="true">
        <circle className="dg-ring-track" cx="66" cy="66" r={R} />
        <circle
          className="dg-ring-arc"
          cx="66"
          cy="66"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
        />
      </svg>
      <div className="dg-ring-center">{children}</div>
    </div>
  )
}

/** 01 — Stepper: the shipping shape. − / value / + with preset pills. */
function IdeaStepper({ t }: { t: T }) {
  const g = useGoal()
  return (
    <div className="dg-stepper">
      <div className="dg-counter">
        <StepButton
          dir="less"
          label={t('settings.goal.less')}
          onClick={() => g.bump(-5)}
        />
        <span className="dg-counter-value">
          <b className="dg-counter-num">{g.value}</b>
          <span className="dg-unit">{t('settings.goal.unit')}</span>
        </span>
        <StepButton
          dir="more"
          label={t('settings.goal.more')}
          onClick={() => g.bump(5)}
        />
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
      </div>
    </div>
  )
}

/** 02 — Dial: the value lives in the ring, steppers flank the presets. */
function IdeaDial({ t }: { t: T }) {
  const g = useGoal()
  const pct = Math.round((TODAY / Math.max(1, g.value)) * 100)
  return (
    <div className="dg-dial">
      <Ring value={g.value}>
        <b className="dg-dial-num">{g.value}</b>
        <span className="dg-dial-unit">{t('settings.goal.unit')}</span>
      </Ring>
      <p className="dg-dial-note">
        {t('settings.goal.today')} <b>{TODAY}</b>
        <span className="dg-sep">/</span>
        {g.value}
        <span className="dg-dial-pct">{pct}%</span>
      </p>
      <div className="dg-controls">
        <StepButton
          dir="less"
          label={t('settings.goal.less')}
          onClick={() => g.bump(-5)}
          small
        />
        <Presets value={g.value} onPick={g.set} />
        <StepButton
          dir="more"
          label={t('settings.goal.more')}
          onClick={() => g.bump(5)}
          small
        />
      </div>
    </div>
  )
}

/** The body of the Inline idea: value + steppers, a meter, the today
 *  readout and the presets. Shared by the lab take and the settings one. */
function InlineBody({
  t,
  g,
  groupSteps,
}: {
  t: T
  g: ReturnType<typeof useGoal>
  groupSteps?: boolean
}) {
  const pct = Math.min(100, (TODAY / Math.max(1, g.value)) * 100)
  return (
    <>
      <div className="dg-inline-top">
        <div className="dg-inline-value">
          <b className="dg-inline-num">{g.value}</b>
          <span className="dg-unit">{t('settings.goal.unit')}</span>
        </div>
        {groupSteps ? (
          <StepGroup
            lessLabel={t('settings.goal.less')}
            moreLabel={t('settings.goal.more')}
            onLess={() => g.bump(-5)}
            onMore={() => g.bump(5)}
          />
        ) : (
          <div className="dg-inline-steps">
            <StepButton
              dir="less"
              label={t('settings.goal.less')}
              onClick={() => g.bump(-5)}
            />
            <StepButton
              dir="more"
              label={t('settings.goal.more')}
              onClick={() => g.bump(5)}
            />
          </div>
        )}
      </div>

      <div className="dg-meter" aria-hidden="true">
        <span className="dg-meter-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="dg-inline-foot">
        <span>
          {t('settings.goal.today')} <b>{TODAY}</b>
          <span className="dg-sep">/</span>
          {g.value}
        </span>
        <span className="dg-inline-pct">{Math.round(pct)}%</span>
      </div>

      <Presets wide value={g.value} onPick={g.set} />
    </>
  )
}

/** 03 — Inline: a settings-row shape. Value and steppers up top, a meter
 *  for today, and the presets as a full-width segmented control. */
function IdeaInline({ t }: { t: T }) {
  const g = useGoal()
  return (
    <div className="dg-inline">
      <InlineBody t={t} g={g} />
    </div>
  )
}

/** 04 — the same Inline shape set into a real Settings “Daily goal” card,
 *  at the card’s true 760 proportion: title on the left, control on the
 *  right, so the control keeps its own proportions instead of stretching. */
function IdeaSettings({ t }: { t: T }) {
  const g = useGoal(20)
  return (
    <div className="dg-setcard">
      <div className="dg-setcard-head">
        <h4 className="dg-setcard-title">{t('settings.goal.title')}</h4>
        <p className="dg-setcard-desc">{t('settings.goal.desc')}</p>
      </div>
      <div className="dg-setcard-body">
        <InlineBody t={t} g={g} groupSteps />
      </div>
    </div>
  )
}

/** Creative bench for the daily-goal control. */
export default function DailyGoalLab() {
  const { t } = useI18n()
  return (
    <div className="dg-list">
      <svg className="dg-defs" width="0" height="0" aria-hidden="true">
        <defs>
          <linearGradient id="dg-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8fdca0" />
            <stop offset="1" stopColor="#c9bb8e" />
          </linearGradient>
        </defs>
      </svg>
      <Idea no="01" label={t('goal.idea.stepper')}>
        <IdeaStepper t={t} />
      </Idea>
      <Idea no="02" label={t('goal.idea.dial')}>
        <IdeaDial t={t} />
      </Idea>
      <Idea no="03" label={t('goal.idea.inline')}>
        <IdeaInline t={t} />
      </Idea>
      <Idea no="04" label={t('goal.idea.settings')} wide>
        <IdeaSettings t={t} />
      </Idea>
    </div>
  )
}
