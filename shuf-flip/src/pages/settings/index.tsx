import { useState } from 'react'
import BackButton from '../../components/BackButton'
import { useI18n } from '../../i18n'
import './settings.css'

/** Words / day options. */
const GOALS = [5, 10, 20, 30, 50]

/** Preview of today's progress toward the goal (appearance only). */
const TODAY = 12

/** New / review balance stops, left (more review) → right (faster new). */
const MIX = [
  { new: 20, review: 80 },
  { new: 35, review: 65 },
  { new: 50, review: 50 },
  { new: 65, review: 35 },
  { new: 80, review: 20 },
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
  const [mix, setMix] = useState(2)
  const [round, setRound] = useState('16')
  const [lang, setLang] = useState('en')

  const m = MIX[mix]
  const goalPct = Math.min(100, (TODAY / goal) * 100)

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
            <span className="set-readout">
              <b>{goal}</b>
              <small>{t('settings.goal.unit')}</small>
            </span>
          </div>

          <div className="set-chips">
            {GOALS.map((g) => (
              <button
                key={g}
                type="button"
                className={`set-chip${g === goal ? ' on' : ''}`}
                aria-pressed={g === goal}
                onClick={() => setGoal(g)}
              >
                {g}
              </button>
            ))}
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

          <div className="set-mix">
            <div className="set-mix-track">
              <div className="set-mix-dots">
                {MIX.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`set-mix-dot${i === mix ? ' on' : ''}`}
                    aria-pressed={i === mix}
                    aria-label={`${s.review} / ${s.new}`}
                    onClick={() => setMix(i)}
                  />
                ))}
              </div>
            </div>
            <div className="set-mix-ends">
              <span className="review">{t('settings.mix.endsReview')}</span>
              <span className="new">{t('settings.mix.endsNew')}</span>
            </div>

            <div className="set-ratio" aria-hidden="true">
              <span className="review" style={{ flexGrow: m.review }} />
              <span className="new" style={{ flexGrow: m.new }} />
            </div>
            <div className="set-legend">
              <span className="review">
                <i />
                {t('settings.mix.review')} <b>{m.review}%</b>
              </span>
              <span className="new">
                <i />
                {t('settings.mix.new')} <b>{m.new}%</b>
              </span>
            </div>
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
