import { useState, type CSSProperties, type ReactNode } from 'react'
import { useI18n } from '../../i18n'
import BackButton from '../../components/BackButton'
import './sceneRail.css'

type Tab = 'home' | 'progress' | 'settings'

const LABEL_KEY: Record<Tab, string> = {
  home: 'nav.home',
  progress: 'nav.progress',
  settings: 'nav.settings',
}

/** Top-to-bottom order: the nav sinks to the foot, Home lowest. */
const ORDER: Tab[] = ['settings', 'progress', 'home']

function HomeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10.2 12 3l9 7.2" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M9.5 20v-5.5h5V20" />
    </svg>
  )
}

function ProgressIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-4" />
      <path d="M12.5 16V8" />
      <path d="M17 16v-6.5" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v2M12 19v2M4.2 7.5l1.7 1M18.1 15.5l1.7 1M4.2 16.5l1.7-1M18.1 8.5l1.7-1" />
    </svg>
  )
}

const ICON: Record<Tab, ReactNode> = {
  home: <HomeIcon />,
  progress: <ProgressIcon />,
  settings: <GearIcon />,
}

/** Avatar wrapped in a progress ring. */
function RingAvatar() {
  const R = 22
  const C = 2 * Math.PI * R
  return (
    <span className="sr-avatar" aria-hidden="true">
      <svg viewBox="0 0 50 50">
        <circle className="sr-ring-track" cx="25" cy="25" r={R} />
        <circle
          className="sr-ring-arc"
          cx="25"
          cy="25"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - 0.68)}
          transform="rotate(-90 25 25)"
        />
      </svg>
      <span className="sr-face">SF</span>
      <i className="sr-online" />
    </span>
  )
}

/** The scene: the Edge-float rail (from the bench's take 12) as a full page —
 *  green left stripe kept floating, ring avatar on top, nav at the foot, the
 *  highlight sliding and a single-color mark on the active item. */
export default function SceneRail() {
  const { lang, t } = useI18n()
  const [tab, setTab] = useState<Tab>('home')

  const week =
    lang === 'zh'
      ? ['一', '二', '三', '四', '五', '六', '日']
      : ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const bars = [42, 70, 55, 88, 64, 30, 76]

  return (
    <div className="sr-scene">
      <BackButton className="deck-home sr-back" />

      <aside className="sr-rail">
        <RingAvatar />

        <nav className="sr-items" style={{ '--active': ORDER.indexOf(tab) } as CSSProperties}>
          <span className="sr-hi" aria-hidden="true" />
          {ORDER.map((id) => {
            const on = tab === id
            return (
              <button
                key={id}
                type="button"
                className={`sr-link${on ? ' on' : ''}`}
                aria-current={on ? 'page' : undefined}
                onClick={() => setTab(id)}
              >
                {ICON[id]}
                <span>{t(LABEL_KEY[id])}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="sr-main">
        <div className="sr-inner" key={tab}>
          {tab === 'home' && (
            <>
              <h1 className="sr-greet">{t('scene.nav.greeting')}</h1>
              <p className="sr-sub">{t('scene.nav.homeSub')}</p>

              <div className="sr-card sr-card--wide">
                <span className="sr-kicker">{t('scene.nav.today')}</span>
                <div className="sr-today">
                  <b>12</b>
                  <span>/ 25 {t('books.words')}</span>
                </div>
                <span className="sr-meter" aria-hidden="true">
                  <span style={{ width: '48%' }} />
                </span>
              </div>

              <div className="sr-grid">
                <div className="sr-card">
                  <span className="sr-kicker">{t('scene.nav.streak')}</span>
                  <b className="sr-num">7</b>
                  <span className="sr-unit">{t('scene.nav.days')}</span>
                </div>
                <div className="sr-card">
                  <span className="sr-kicker">{t('scene.nav.learned')}</span>
                  <b className="sr-num">1,240</b>
                  <span className="sr-unit">{t('books.words')}</span>
                </div>
              </div>
            </>
          )}

          {tab === 'progress' && (
            <>
              <h1 className="sr-greet">{t('nav.progress')}</h1>
              <p className="sr-sub">{t('scene.nav.progressSub')}</p>

              <div className="sr-card sr-chart">
                <div className="sr-bars">
                  {bars.map((h, i) => (
                    <span className="sr-bar" key={i}>
                      <i style={{ height: `${h}%` }} />
                      <em>{week[i]}</em>
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'settings' && (
            <>
              <h1 className="sr-greet">{t('nav.settings')}</h1>
              <p className="sr-sub">{t('scene.nav.settingsSub')}</p>

              <div className="sr-rows">
                <div className="sr-row">
                  <span>{t('settings.goal.title')}</span>
                  <b>
                    25 {t('settings.goal.unit')}
                  </b>
                </div>
                <div className="sr-row">
                  <span>{t('scene.nav.language')}</span>
                  <b>{lang === 'zh' ? '中文' : 'English'}</b>
                </div>
                <div className="sr-row">
                  <span>{t('scene.nav.theme')}</span>
                  <b>{t('scene.nav.dark')}</b>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
