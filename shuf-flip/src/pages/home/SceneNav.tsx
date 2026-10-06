import { useState, type ReactNode } from 'react'
import { useI18n } from '../../i18n'
import BackButton from '../../components/BackButton'
import { BOOKS } from '../books/data'
import './sceneNav.css'

type Tab = 'home' | 'progress' | 'books' | 'settings'

const fmt = (n: number) => n.toLocaleString('en-US')

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

function BookIcon() {
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
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 5.5V20.5" />
      <path d="M8 7h8" />
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

/** The scene: a floating left rail — avatar on top, then Home / Progress /
 *  Wordbooks / Settings — over a soft page. Appearance + local state only. */
export default function SceneNav() {
  const { lang, t } = useI18n()
  const [tab, setTab] = useState<Tab>('home')

  const items: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: 'home', label: t('nav.home'), icon: <HomeIcon /> },
    { id: 'progress', label: t('nav.progress'), icon: <ProgressIcon /> },
    { id: 'books', label: t('nav.books'), icon: <BookIcon /> },
    { id: 'settings', label: t('nav.settings'), icon: <GearIcon /> },
  ]

  const week =
    lang === 'zh'
      ? ['一', '二', '三', '四', '五', '六', '日']
      : ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const bars = [42, 70, 55, 88, 64, 30, 76]

  return (
    <div className="nv-scene">
      <BackButton className="deck-home nv-back" />

      <aside className="nv-rail">
        <button type="button" className="nv-avatar" aria-label="profile">
          SF
          <span className="nv-avatar-dot" aria-hidden="true" />
        </button>

        <nav className="nv-items" aria-label={t('scene.nav.title')}>
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              className={`nv-link${tab === it.id ? ' on' : ''}`}
              aria-current={tab === it.id ? 'page' : undefined}
              onClick={() => setTab(it.id)}
            >
              {it.icon}
              <span>{it.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="nv-main">
        <div className="nv-inner" key={tab}>
          {tab === 'home' && (
            <>
              <h1 className="nv-greet">{t('scene.nav.greeting')}</h1>
              <p className="nv-sub">{t('scene.nav.homeSub')}</p>

              <div className="nv-grid">
                <div className="nv-card nv-card-wide">
                  <span className="nv-kicker">{t('scene.nav.today')}</span>
                  <div className="nv-today-row">
                    <b>12</b>
                    <span>/ 25 {t('books.words')}</span>
                  </div>
                  <span className="nv-meter" aria-hidden="true">
                    <span style={{ width: '48%' }} />
                  </span>
                </div>
                <div className="nv-card">
                  <span className="nv-kicker">{t('scene.nav.streak')}</span>
                  <b className="nv-num">7</b>
                  <span className="nv-unit">{t('scene.nav.days')}</span>
                </div>
                <div className="nv-card">
                  <span className="nv-kicker">{t('scene.nav.learned')}</span>
                  <b className="nv-num">1,240</b>
                  <span className="nv-unit">{t('books.words')}</span>
                </div>
              </div>
            </>
          )}

          {tab === 'progress' && (
            <>
              <h1 className="nv-greet">{t('nav.progress')}</h1>
              <p className="nv-sub">{t('scene.nav.progressSub')}</p>

              <div className="nv-card nv-chart">
                <div className="nv-bars">
                  {bars.map((h, i) => (
                    <span className="nv-bar" key={i}>
                      <i style={{ height: `${h}%` }} />
                      <em>{week[i]}</em>
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'books' && (
            <>
              <h1 className="nv-greet">{t('nav.books')}</h1>
              <p className="nv-sub">{t('scene.nav.booksSub')}</p>

              <div className="nv-books">
                {BOOKS.slice(0, 4).map((b) => (
                  <div className="nv-book" key={b.id}>
                    <span className="nv-book-name">{b.name[lang]}</span>
                    <span className="nv-book-foot">
                      <span className="nv-book-bar" aria-hidden="true">
                        <span
                          style={{
                            width: `${Math.round((b.learned / b.total) * 100)}%`,
                          }}
                        />
                      </span>
                      <span>
                        {fmt(b.learned)} / {fmt(b.total)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'settings' && (
            <>
              <h1 className="nv-greet">{t('nav.settings')}</h1>
              <p className="nv-sub">{t('scene.nav.settingsSub')}</p>

              <div className="nv-rows">
                <div className="nv-row">
                  <span>{t('settings.goal.title')}</span>
                  <b>25 {t('settings.goal.unit')}</b>
                </div>
                <div className="nv-row">
                  <span>{t('scene.nav.language')}</span>
                  <b>{lang === 'zh' ? '中文' : 'English'}</b>
                </div>
                <div className="nv-row">
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
