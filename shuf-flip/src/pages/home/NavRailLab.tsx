import { useState, type ReactNode } from 'react'
import { useI18n } from '../../i18n'
import './navRailLab.css'

type Tab = 'home' | 'progress' | 'settings'

const TABS: Tab[] = ['home', 'progress', 'settings']

/** Nav labels reuse the page strings shipped with the app. */
const LABEL_KEY: Record<Tab, string> = {
  home: 'nav.home',
  progress: 'nav.progress',
  settings: 'nav.settings',
}

function HomeIcon() {
  return (
    <svg
      width="17"
      height="17"
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
      width="17"
      height="17"
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
      width="17"
      height="17"
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

type Ctx = {
  tab: Tab
  setTab: (t: Tab) => void
  labels: boolean
  t: (key: string) => string
}

/** The shared identity: avatar + online dot. */
function Avatar({ ring = false }: { ring?: boolean }) {
  return (
    <span
      className={`nr-avatar${ring ? ' nr-avatar--ring' : ''}`}
      aria-hidden="true"
    >
      SF
      <i className="nr-online" />
    </span>
  )
}

/** The three nav options, restyled per take via `linkClass` / `navClass`. */
function Items({
  ctx,
  navClass = '',
  linkClass = '',
}: {
  ctx: Ctx
  navClass?: string
  linkClass?: string
}) {
  const { tab, setTab, labels, t } = ctx
  return (
    <nav className={`nr-items${navClass ? ' ' + navClass : ''}`}>
      {TABS.map((id) => {
        const on = tab === id
        return (
          <button
            key={id}
            type="button"
            title={t(LABEL_KEY[id])}
            aria-label={t(LABEL_KEY[id])}
            aria-current={on ? 'page' : undefined}
            className={`nr-link${linkClass ? ' ' + linkClass : ''}${
              on ? ' on' : ''
            }`}
            onClick={() => setTab(id)}
          >
            {ICON[id]}
            {labels && <span className="nr-link-label">{t(LABEL_KEY[id])}</span>}
          </button>
        )
      })}
    </nav>
  )
}

/** The soft page the rail floats over. Repeats the active tab's content so the
 *  rail reads as real navigation, and can go dense to test contrast. */
function MockPage({
  tab,
  dense,
  lang,
  t,
}: {
  tab: Tab
  dense: boolean
  lang: string
  t: (key: string) => string
}) {
  return (
    <div className="nr-page" aria-hidden="true">
      {tab === 'home' && (
        <>
          <div className="nr-p-greet">{t('scene.nav.greeting')}</div>
          <div className="nr-p-sub">{t('scene.nav.homeSub')}</div>
          <div className="nr-p-card">
            <span className="nr-p-kicker">{t('scene.nav.today')}</span>
            <div className="nr-p-big">
              12 <em>/ 25 {t('books.words')}</em>
            </div>
            <span className="nr-p-meter">
              <i style={{ width: '48%' }} />
            </span>
          </div>
          <div className="nr-p-duo">
            <div className="nr-p-tile">
              <span className="nr-p-kicker">{t('scene.nav.streak')}</span>
              <b>7</b>
            </div>
            <div className="nr-p-tile">
              <span className="nr-p-kicker">{t('scene.nav.learned')}</span>
              <b>1,240</b>
            </div>
          </div>
        </>
      )}

      {tab === 'progress' && (
        <>
          <div className="nr-p-greet">{t('nav.progress')}</div>
          <div className="nr-p-sub">{t('scene.nav.progressSub')}</div>
          <div className="nr-p-card nr-p-chart">
            {[42, 70, 55, 88, 64, 30, 76].map((h, i) => (
              <span className="nr-p-bar" key={i}>
                <i style={{ height: `${h}%` }} />
              </span>
            ))}
          </div>
        </>
      )}

      {tab === 'settings' && (
        <>
          <div className="nr-p-greet">{t('nav.settings')}</div>
          <div className="nr-p-sub">{t('scene.nav.settingsSub')}</div>
          <div className="nr-p-rows">
            <div className="nr-p-line">
              <span>{t('settings.goal.title')}</span>
              <b>25 {t('settings.goal.unit')}</b>
            </div>
            <div className="nr-p-line">
              <span>{t('scene.nav.language')}</span>
              <b>{lang === 'zh' ? '中文' : 'English'}</b>
            </div>
            <div className="nr-p-line">
              <span>{t('scene.nav.theme')}</span>
              <b>{t('scene.nav.dark')}</b>
            </div>
          </div>
        </>
      )}

      {dense && (
        <div className="nr-p-dense">
          {[0, 1, 2, 3, 4].map((i) => (
            <span className="nr-p-skel" key={i} />
          ))}
        </div>
      )}
    </div>
  )
}

/** One take: the mock page with a rail floating over it. */
function Screen({
  ctx,
  dense,
  lang,
  children,
}: {
  ctx: Ctx
  dense: boolean
  lang: string
  children: ReactNode
}) {
  return (
    <div className={`nr-screen${dense ? ' dense' : ''}`}>
      <MockPage tab={ctx.tab} dense={dense} lang={lang} t={ctx.t} />
      {children}
    </div>
  )
}

/** A numbered bench row: caption above the mock screen. */
function Idea({
  no,
  label,
  children,
}: {
  no: string
  label: string
  children: ReactNode
}) {
  return (
    <section className="nr-idea">
      <header className="nr-idea-head">
        <span className="nr-idea-no">{no}</span>
        <h3 className="nr-idea-label">{label}</h3>
      </header>
      <div className="nr-stage">{children}</div>
    </section>
  )
}

/** Creative bench for the left rail. Two controls up top, then six takes on a
 *  floating rail — avatar on top, Home / Progress / Settings below. */
export default function NavRailLab() {
  const { lang, t } = useI18n()
  const [tab, setTab] = useState<Tab>('home')
  const [dense, setDense] = useState(false)

  const ctx: Ctx = { tab, setTab, labels: true, t }
  const iconCtx: Ctx = { ...ctx, labels: false }

  const tabs: { id: Tab; label: string }[] = TABS.map((id) => ({
    id,
    label: t(LABEL_KEY[id]),
  }))

  return (
    <div className="nr-lab">
      <div className="nr-picker">
        <div className="nr-picker-row">
          <span className="nr-picker-title">{t('nr.active')}</span>
          <div className="nr-seg">
            {tabs.map((x) => (
              <button
                key={x.id}
                type="button"
                className={`nr-seg-btn${tab === x.id ? ' on' : ''}`}
                aria-pressed={tab === x.id}
                onClick={() => setTab(x.id)}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>
        <div className="nr-picker-row">
          <span className="nr-picker-title">{t('nr.backdrop')}</span>
          <div className="nr-seg">
            <button
              type="button"
              className={`nr-seg-btn${!dense ? ' on' : ''}`}
              aria-pressed={!dense}
              onClick={() => setDense(false)}
            >
              {t('nr.backdrop.calm')}
            </button>
            <button
              type="button"
              className={`nr-seg-btn${dense ? ' on' : ''}`}
              aria-pressed={dense}
              onClick={() => setDense(true)}
            >
              {t('nr.backdrop.dense')}
            </button>
          </div>
        </div>
      </div>

      <div className="nr-ideas">
        <Idea no="01" label={t('nr.idea.pill')}>
          <Screen ctx={ctx} dense={dense} lang={lang}>
            <aside className="nr-rail nr-rail--pill">
              <Avatar />
              <Items ctx={ctx} />
            </aside>
          </Screen>
        </Idea>

        <Idea no="02" label={t('nr.idea.dock')}>
          <Screen ctx={ctx} dense={dense} lang={lang}>
            <aside className="nr-rail nr-rail--dock">
              <Avatar />
              <Items ctx={iconCtx} linkClass="nr-link--sq" navClass="nr-items--dock" />
            </aside>
          </Screen>
        </Idea>

        <Idea no="03" label={t('nr.idea.cards')}>
          <Screen ctx={ctx} dense={dense} lang={lang}>
            <div className="nr-stack">
              <div className="nr-floating nr-floating--avatar">
                <Avatar />
              </div>
              <div className="nr-floating nr-floating--nav">
                <Items ctx={ctx} linkClass="nr-link--card" />
              </div>
            </div>
          </Screen>
        </Idea>

        <Idea no="04" label={t('nr.idea.indicator')}>
          <Screen ctx={ctx} dense={dense} lang={lang}>
            <aside className="nr-rail nr-rail--indicator">
              <Avatar ring />
              <span className="nr-sep" />
              <Items ctx={ctx} linkClass="nr-link--ind" />
            </aside>
          </Screen>
        </Idea>

        <Idea no="05" label={t('nr.idea.accent')}>
          <Screen ctx={ctx} dense={dense} lang={lang}>
            <aside className="nr-rail nr-rail--accent">
              <Avatar />
              <Items ctx={ctx} linkClass="nr-link--accent" />
            </aside>
          </Screen>
        </Idea>

        <Idea no="06" label={t('nr.idea.ghost')}>
          <Screen ctx={ctx} dense={dense} lang={lang}>
            <aside className="nr-rail nr-rail--ghost">
              <Avatar />
              <Items ctx={ctx} linkClass="nr-link--ghost" />
            </aside>
          </Screen>
        </Idea>
      </div>
    </div>
  )
}
