import { useState, type CSSProperties, type ReactNode } from 'react'
import { useI18n } from '../../i18n'
import './navRailLab.css'

type Tab = 'home' | 'progress' | 'settings'

const TABS: Tab[] = ['home', 'progress', 'settings']

/** Bottom-to-top order for the take whose nav sits at the foot of the rail. */
const ORDER: Tab[] = ['settings', 'progress', 'home']

/** Nav labels reuse the page strings shipped with the app. */
const LABEL_KEY: Record<Tab, string> = {
  home: 'nav.home',
  progress: 'nav.progress',
  settings: 'nav.settings',
}

/** Per-item hue for the color-coded take. */
const COLOR: Record<Tab, string> = {
  home: '#8fdca0',
  progress: '#c9bb8e',
  settings: '#8fa9c9',
}

/** A couple of counts for the badge take. */
const BADGE: Partial<Record<Tab, number>> = { home: 2, progress: 3 }

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

type Bi = { en: string; zh: string }

type Ctx = {
  tab: Tab
  setTab: (t: Tab) => void
  t: (key: string) => string
  lang: string
}

/** Avatar: the one constant across every take. */
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

/** Avatar wrapped in a progress ring. */
function RingAvatar() {
  const R = 21
  const C = 2 * Math.PI * R
  return (
    <span className="nr-ring">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle className="nr-ring-track" cx="24" cy="24" r={R} />
        <circle
          className="nr-ring-arc"
          cx="24"
          cy="24"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - 0.68)}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <span className="nr-ring-face">SF</span>
      <i className="nr-online" />
    </span>
  )
}

/** The three options. Styling is entirely per-take via `cls` + options. */
function Links({
  ctx,
  cls = '',
  labels = true,
  badges = false,
  colors = false,
  order = TABS,
}: {
  ctx: Ctx
  cls?: string
  labels?: boolean
  badges?: boolean
  colors?: boolean
  order?: Tab[]
}) {
  return (
    <>
      {order.map((id) => {
        const on = ctx.tab === id
        return (
          <button
            key={id}
            type="button"
            title={ctx.t(LABEL_KEY[id])}
            aria-label={ctx.t(LABEL_KEY[id])}
            aria-current={on ? 'page' : undefined}
            className={`nr-link${cls ? ' ' + cls : ''}${on ? ' on' : ''}`}
            style={colors ? ({ '--c': COLOR[id] } as CSSProperties) : undefined}
            onClick={() => ctx.setTab(id)}
          >
            {ICON[id]}
            {labels && (
              <span className="nr-link-label">{ctx.t(LABEL_KEY[id])}</span>
            )}
            {badges && BADGE[id] != null && (
              <span className="nr-badge">{BADGE[id]}</span>
            )}
          </button>
        )
      })}
    </>
  )
}

/** A `nav` wrapper so every take gets the same vertical rhythm. */
function Nav({
  ctx,
  cls = '',
  navClass = '',
  labels,
  badges,
  colors,
}: {
  ctx: Ctx
  cls?: string
  navClass?: string
  labels?: boolean
  badges?: boolean
  colors?: boolean
}) {
  return (
    <nav className={`nr-items${navClass ? ' ' + navClass : ''}`}>
      <Links ctx={ctx} cls={cls} labels={labels} badges={badges} colors={colors} />
    </nav>
  )
}

type Idea = {
  no: string
  name: Bi
  desc: Bi
  render: (ctx: Ctx) => ReactNode
}

const pick = (b: Bi, lang: string) => (lang === 'zh' ? b.zh : b.en)

/** The bench itself: many takes, each just the rail. */
const IDEAS: Idea[] = [
  {
    no: '01',
    name: { en: 'Pill', zh: '药丸' },
    desc: {
      en: 'Rounded rail; the active item is a filled pill.',
      zh: '圆角竖栏，选中项填成实心药丸。',
    },
    render: (c) => (
      <aside className="nr-rail nr-rail--pill">
        <Avatar />
        <Nav ctx={c} />
      </aside>
    ),
  },
  {
    no: '02',
    name: { en: 'Capsule', zh: '胶囊' },
    desc: {
      en: 'Fully rounded capsule; the active item is a green dot.',
      zh: '全圆角窄栏，选中是一颗绿圆点。',
    },
    render: (c) => (
      <aside className="nr-rail nr-rail--capsule">
        <Avatar />
        <Nav ctx={c} cls="nr-link--cap" labels={false} navClass="nr-items--fit" />
      </aside>
    ),
  },
  {
    no: '03',
    name: { en: 'Split cards', zh: '分卡片' },
    desc: {
      en: 'Avatar and nav live in two separate floating cards.',
      zh: '头像和导航分成两张悬浮卡片。',
    },
    render: (c) => (
      <div className="nr-stack">
        <div className="nr-piece nr-piece--avatar">
          <Avatar />
        </div>
        <div className="nr-piece nr-piece--nav">
          <Nav ctx={c} cls="nr-link--piece" />
        </div>
      </div>
    ),
  },
  {
    no: '04',
    name: { en: 'Edge dock', zh: '贴边' },
    desc: {
      en: 'Docked to the screen edge: square left side, no float.',
      zh: '贴住屏幕左缘：左侧直角、不悬浮。',
    },
    render: (c) => (
      <aside className="nr-rail nr-rail--flush">
        <Avatar />
        <Nav ctx={c} cls="nr-link--flush" />
      </aside>
    ),
  },
  {
    no: '05',
    name: { en: 'Header', zh: '带头' },
    desc: {
      en: 'A titled header above the avatar; wider and more complete.',
      zh: '顶部标题 + 头像，栏更宽、信息更完整。',
    },
    render: (c) => (
      <aside className="nr-rail nr-rail--wide">
        <div className="nr-wide-head">
          <Avatar />
          <div className="nr-wide-id">
            <b>{pick({ en: 'Menu', zh: '菜单' }, c.lang)}</b>
            <span>{pick({ en: 'Free plan', zh: '免费版' }, c.lang)}</span>
          </div>
        </div>
        <Nav ctx={c} cls="nr-link--wide" />
      </aside>
    ),
  },
  {
    no: '06',
    name: { en: 'Indicator', zh: '指示条' },
    desc: {
      en: 'A vertical green bar marks the active item.',
      zh: '选中项左侧一条竖直绿条 + 淡底。',
    },
    render: (c) => (
      <aside className="nr-rail nr-rail--pill">
        <Avatar ring />
        <Nav ctx={c} cls="nr-link--ind" />
      </aside>
    ),
  },
  {
    no: '07',
    name: { en: 'Sliding pill', zh: '滑动块' },
    desc: {
      en: 'One highlight slides between the items.',
      zh: '一块高亮在各项之间滑动。',
    },
    render: (c) => (
      <aside className="nr-rail nr-rail--pill">
        <Avatar />
        <nav
          className="nr-items nr-items--seg"
          style={{ '--active': TABS.indexOf(c.tab) } as CSSProperties}
        >
          <span className="nr-seg-hi" aria-hidden="true" />
          <Links ctx={c} cls="nr-link--seg" />
        </nav>
      </aside>
    ),
  },
  {
    no: '08',
    name: { en: 'Color-coded', zh: '彩标' },
    desc: {
      en: 'Each item has its own hue; the active one lights it up.',
      zh: '每项自带颜色，选中点亮自己的色。',
    },
    render: (c) => (
      <aside className="nr-rail nr-rail--pill">
        <Avatar />
        <Nav ctx={c} cls="nr-link--color" colors />
      </aside>
    ),
  },
  {
    no: '09',
    name: { en: 'Ring avatar', zh: '环像' },
    desc: {
      en: 'The avatar wears a progress ring.',
      zh: '头像带一圈进度环。',
    },
    render: (c) => (
      <aside className="nr-rail nr-rail--pill">
        <RingAvatar />
        <Nav ctx={c} />
      </aside>
    ),
  },
  {
    no: '10',
    name: { en: 'Badges', zh: '徽标' },
    desc: {
      en: 'Items carry small count badges.',
      zh: '项右侧带小徽标（如待办数）。',
    },
    render: (c) => (
      <aside className="nr-rail nr-rail--pill">
        <Avatar />
        <Nav ctx={c} cls="nr-link--badge" badges />
      </aside>
    ),
  },
  {
    no: '11',
    name: { en: 'Edge float', zh: '浮边' },
    desc: {
      en: 'The edge dock’s green left stripe, kept floating; the highlight slides, and the nav sinks to the foot — Settings up top, Home lowest.',
      zh: '贴边的绿色左边条，但保持悬浮；高亮滑动，选项沉到底部——设置在上，主页在最下。',
    },
    render: (c) => (
      <aside className="nr-rail nr-rail--edgerail">
        <RingAvatar />
        <nav
          className="nr-items nr-items--seg nr-items--bottom"
          style={{ '--active': ORDER.indexOf(c.tab) } as CSSProperties}
        >
          <span className="nr-seg-hi" aria-hidden="true" />
          <Links ctx={c} cls="nr-link--seg" order={ORDER} />
        </nav>
      </aside>
    ),
  },
  {
    no: '12',
    name: { en: 'Mono mark', zh: '单色标' },
    desc: {
      en: 'The edge float, but the active item is marked by a single-color tick and tint — no sliding pill, no per-item hues.',
      zh: '在浮边的基础上，选中项改用单色左边条 + 淡底高亮，不用滑动药丸，也不换颜色。',
    },
    render: (c) => (
      <aside className="nr-rail nr-rail--edgerail">
        <RingAvatar />
        <nav
          className="nr-items nr-items--bottom"
          style={{ '--c': '#8fdca0' } as CSSProperties}
        >
          <Links ctx={c} cls="nr-link--color" order={ORDER} />
        </nav>
      </aside>
    ),
  },
]

/** Creative bench for the left rail. Just the rail, many takes, several per
 *  row; each has an avatar on top and Home / Progress / Settings below. The
 *  one control picks the active item so every take previews the same state. */
export default function NavRailLab() {
  const { lang, t } = useI18n()
  const [tab, setTab] = useState<Tab>('home')

  const ctx: Ctx = { tab, setTab, t, lang }

  return (
    <div className="nr-lab">
      <div className="nr-picker">
        <span className="nr-picker-title">{t('nr.active')}</span>
        <div className="nr-seg">
          {TABS.map((id) => (
            <button
              key={id}
              type="button"
              className={`nr-seg-btn${tab === id ? ' on' : ''}`}
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
            >
              {t(LABEL_KEY[id])}
            </button>
          ))}
        </div>
      </div>

      <div className="nr-list">
        {IDEAS.map((idea) => (
          <article className="nr-row" key={idea.no}>
            <div className="nr-railwrap">{idea.render(ctx)}</div>
            <div className="nr-meta">
              <span className="nr-no">{idea.no}</span>
              <h3>{pick(idea.name, lang)}</h3>
              <p>{pick(idea.desc, lang)}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
