import { useRef, useState } from 'react'
import BackButton from '../../components/BackButton'
import { useI18n } from '../../i18n'
import './settings.css'

/** Words / day presets. */
const GOALS = [5, 10, 20, 30, 50]

/** Custom goal bounds. */
const MIN_GOAL = 5
const MAX_GOAL = 200

const clampGoal = (n: number) =>
  Math.max(MIN_GOAL, Math.min(MAX_GOAL, Math.round(n)))

/** Preview of today's progress toward the goal (appearance only). */
const TODAY = 12

/** Review / new balance presets. The default one is preselected. */
const MIX = [
  {
    value: 'review',
    labelKey: 'settings.mix.moreReview',
    new: 35,
    review: 65,
    note: '注释1',
  },
  {
    value: 'default',
    labelKey: 'settings.mix.default',
    new: 50,
    review: 50,
    note: '注释2',
  },
  {
    value: 'new',
    labelKey: 'settings.mix.faster',
    new: 65,
    review: 35,
    note: '注释3',
  },
]

const ROUNDS = ['8', '16']

const LANGS = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
]

type Option = { value: string; label: string }

/** A pill segmented control. */
function Seg({
  value,
  options,
  onChange,
}: {
  value: string
  options: Option[]
  onChange: (v: string) => void
}) {
  return (
    <div className="set-seg">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={value === o.value ? 'on' : ''}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Creative: study preferences — appearance only, held in local state. */
export default function Settings() {
  const { t } = useI18n()
  const [goal, setGoal] = useState(20)
  const [goalDraft, setGoalDraft] = useState('20')
  const [mix, setMix] = useState(1)
  const [round, setRound] = useState('16')
  const [lang, setLang] = useState('en')

  const goalRef = useRef<HTMLInputElement>(null)
  const isCustom = !GOALS.includes(goal)

  const applyGoal = (n: number) => {
    const c = clampGoal(n)
    setGoal(c)
    setGoalDraft(String(c))
  }

  const onGoalDraft = (raw: string) => {
    setGoalDraft(raw)
    const n = Number(raw)
    if (raw !== '' && Number.isFinite(n) && n > 0) setGoal(Math.round(n))
  }

  const goalPct = Math.min(100, (TODAY / Math.max(1, goal)) * 100)

  return (
    <div className="set-page">
      <BackButton />

      <header className="set-head">
        <h1 className="set-title">{t('settings.title')}</h1>
        <p className="set-desc">{t('settings.desc')}</p>
      </header>

      <div className="set-body">
        {/* daily goal */}
        <section className="set-card">
          <div className="set-card-head">
            <div>
              <h2 className="set-card-title">{t('settings.goal.title')}</h2>
              <p className="set-card-desc">{t('settings.goal.desc')}</p>
            </div>
          </div>

          <div className="set-goal">
            <button
              type="button"
              className="set-goal-step"
              aria-label={t('settings.goal.less')}
              onClick={() => applyGoal(goal - 5)}
            >
              −
            </button>
            <label className="set-goal-field">
              <input
                ref={goalRef}
                className="set-goal-input"
                type="number"
                min={MIN_GOAL}
                max={MAX_GOAL}
                step={5}
                value={goalDraft}
                aria-label={t('settings.goal.title')}
                onChange={(e) => onGoalDraft(e.target.value)}
                onBlur={() => applyGoal(Number(goalDraft) || goal)}
              />
              <span className="set-goal-unit">{t('settings.goal.unit')}</span>
            </label>
            <button
              type="button"
              className="set-goal-step"
              aria-label={t('settings.goal.more')}
              onClick={() => applyGoal(goal + 5)}
            >
              +
            </button>
          </div>

          <div className="set-presets">
            {GOALS.map((g) => (
              <button
                key={g}
                type="button"
                className={`set-preset${g === goal ? ' on' : ''}`}
                aria-pressed={g === goal}
                onClick={() => applyGoal(g)}
              >
                {g}
              </button>
            ))}
            <button
              type="button"
              className={`set-preset set-preset-custom${isCustom ? ' on' : ''}`}
              aria-pressed={isCustom}
              onClick={() => goalRef.current?.select()}
            >
              {t('settings.goal.custom')}
            </button>
          </div>

          <div className="set-meter">
            <span className="set-meter-fill" style={{ width: `${goalPct}%` }} />
          </div>
          <p className="set-meter-note">
            {t('settings.goal.today')} · <b>{TODAY}</b> / {goal}
          </p>
        </section>

        {/* new vs review */}
        <section className="set-card">
          <div className="set-card-head">
            <div>
              <h2 className="set-card-title">{t('settings.mix.title')}</h2>
              <p className="set-card-desc">{t('settings.mix.desc')}</p>
            </div>
          </div>

          <div
            className="set-choices"
            role="radiogroup"
            aria-label={t('settings.mix.title')}
          >
            {MIX.map((o, i) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={i === mix}
                className={`set-choice${i === mix ? ' on' : ''}`}
                onClick={() => setMix(i)}
              >
                <span className="set-choice-head">
                  <span className="set-choice-radio" aria-hidden="true" />
                  <span className="set-choice-label">{t(o.labelKey)}</span>
                </span>
                <span className="set-choice-bar" aria-hidden="true">
                  <span className="review" style={{ flexGrow: o.review }} />
                  <span className="new" style={{ flexGrow: o.new }} />
                </span>
                <span className="set-choice-note">{o.note}</span>
              </button>
            ))}
          </div>
        </section>

        {/* round size + language */}
        <div className="set-grid">
          <section className="set-card">
            <div className="set-card-head">
              <div>
                <h2 className="set-card-title">{t('settings.round.title')}</h2>
                <p className="set-card-desc">{t('settings.round.desc')}</p>
              </div>
            </div>
            <Seg
              value={round}
              onChange={setRound}
              options={ROUNDS.map((r) => ({
                value: r,
                label: `${r} ${t('settings.round.unit')}`,
              }))}
            />
          </section>

          <section className="set-card">
            <div className="set-card-head">
              <div>
                <h2 className="set-card-title">{t('settings.lang.title')}</h2>
                <p className="set-card-desc">{t('settings.lang.desc')}</p>
              </div>
            </div>
            <Seg value={lang} onChange={setLang} options={LANGS} />
          </section>
        </div>
      </div>

      <p className="set-note">{t('settings.note')}</p>
    </div>
  )
}
