import { useState } from 'react'
import type { CSSProperties } from 'react'
import HomeShell from './HomeShell'
import { useResolvedTheme } from '../../components/useResolvedTheme'
import { useI18n } from '../../i18n'
import { WORDS } from '../flip/data'
import './design.css'

type Bilingual = { en: string; zh: string }

type Palette = {
  id: string
  variant: Bilingual
  vars: Record<string, string>
}

type ColorEntry = {
  id: string
  name: Bilingual
  variants: Palette[]
}

// Rating trios (see tokens.css): a dark-friendly and a light-friendly set.
const RATE_DARK = {
  '--rate-r': '#9e5563',
  '--rate-r-on': '#2b0d12',
  '--rate-y': '#b28a3a',
  '--rate-y-solid': '#b28a3a',
  '--rate-y-on': '#2e2100',
  '--rate-g': '#62866f',
  '--rate-g-on': '#0c1c14',
}
const RATE_LIGHT = {
  '--rate-r': '#6b2330',
  '--rate-r-on': '#fdf4f5',
  '--rate-y': '#6a4b10',
  '--rate-y-solid': '#98721f',
  '--rate-y-on': '#3b2a00',
  '--rate-g': '#2e513b',
  '--rate-g-on': '#eef4f0',
}

const SHADOW_DARK =
  '0 18px 40px -18px rgba(6, 10, 4, 0.6), 0 2px 6px -2px rgba(6, 10, 4, 0.5)'
const SHADOW_LIGHT =
  '0 18px 40px -18px rgba(45, 32, 15, 0.5), 0 2px 6px -2px rgba(45, 32, 15, 0.28)'

// The surfaces shown in the palette strip of each preview.
const SWATCHES: { key: string; label: string }[] = [
  { key: '--bg', label: 'BG' },
  { key: '--card', label: 'Card' },
  { key: '--card-active', label: 'Card +' },
  { key: '--border', label: 'Border' },
  { key: '--text', label: 'Text' },
  { key: '--muted', label: 'Muted' },
  { key: '--accent', label: 'Accent' },
]

// The app's two built-in themes; merged into one "Default" entry that follows
// the theme toggle.
const LIGHT_PALETTE: Palette = {
  id: 'parchment',
  variant: { en: 'Parchment', zh: '羊皮纸' },
  vars: {
    '--bg': '#efe6d3',
    '--card': '#fdf8ec',
    '--card-active': '#fffcf3',
    '--border': '#ddcfb2',
    '--text': '#2a2418',
    '--muted': '#837458',
    '--accent': '#7a5f36',
    '--on-accent': '#fdf8ec',
    '--card-shadow': SHADOW_LIGHT,
    ...RATE_LIGHT,
  },
}

const DARK_PALETTE: Palette = {
  id: 'sprout',
  variant: { en: 'Sprout', zh: '嫩芽' },
  vars: {
    '--bg': '#223026',
    '--card': '#2c3c30',
    '--card-active': '#35463a',
    '--border': '#485c4d',
    '--text': '#e7f1ea',
    '--muted': '#a0b0a3',
    '--accent': '#c9bb8e',
    '--on-accent': '#221b10',
    '--card-shadow': SHADOW_DARK,
    ...RATE_DARK,
  },
}

// The extra colour entries. Reds / greens are sampled from
// docs/preview/dark.html; yellows and whites are tuned in the same spirit.
const COLOR_ENTRIES: ColorEntry[] = [
  {
    id: 'red',
    name: { en: 'Red', zh: '红色' },
    variants: [
      {
        id: 'wine-ink',
        variant: { en: 'Wine ink', zh: '酒红墨' },
        vars: {
          '--bg': '#170f12',
          '--card': '#24161b',
          '--card-active': '#2e1c23',
          '--border': '#452b34',
          '--text': '#f0e4e8',
          '--muted': '#ac94a0',
          '--accent': '#d2b48c',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'rosewood',
        variant: { en: 'Rosewood', zh: '玫瑰木' },
        vars: {
          '--bg': '#191112',
          '--card': '#281b1e',
          '--card-active': '#322327',
          '--border': '#4a3439',
          '--text': '#f2e6e7',
          '--muted': '#b09ba0',
          '--accent': '#d3aa93',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'red-brown',
        variant: { en: 'Deep red-brown', zh: '深红棕' },
        vars: {
          '--bg': '#1a1210',
          '--card': '#2a1d19',
          '--card-active': '#34241f',
          '--border': '#4b362e',
          '--text': '#f3e8e0',
          '--muted': '#b09a8d',
          '--accent': '#d6b48f',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'rust',
        variant: { en: 'Rust', zh: '铁锈' },
        vars: {
          '--bg': '#180f0b',
          '--card': '#271812',
          '--card-active': '#321f17',
          '--border': '#4d3125',
          '--text': '#f3e7dc',
          '--muted': '#b39a89',
          '--accent': '#d69f78',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'rose-grey',
        variant: { en: 'Rose grey', zh: '玫瑰灰' },
        vars: {
          '--bg': '#181314',
          '--card': '#241d1f',
          '--card-active': '#2d2528',
          '--border': '#40373a',
          '--text': '#eee7e8',
          '--muted': '#a89da0',
          '--accent': '#c9a79f',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'burgundy',
        variant: { en: 'Burgundy', zh: '勃艮第' },
        vars: {
          '--bg': '#150c12',
          '--card': '#22141d',
          '--card-active': '#2b1a25',
          '--border': '#3f2837',
          '--text': '#efe2eb',
          '--muted': '#a58fa0',
          '--accent': '#cf9fb4',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
    ],
  },
  {
    id: 'green',
    name: { en: 'Green', zh: '绿色' },
    variants: [
      {
        id: 'deep-pine',
        variant: { en: 'Deep pine', zh: '深松针' },
        vars: {
          '--bg': '#0b120e',
          '--card': '#131d17',
          '--card-active': '#19261e',
          '--border': '#263a2e',
          '--text': '#dfeae2',
          '--muted': '#8aa094',
          '--accent': '#c6b584',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'ink-green',
        variant: { en: 'Ink green', zh: '墨绿' },
        vars: {
          '--bg': '#0f1512',
          '--card': '#18211c',
          '--card-active': '#1f2a24',
          '--border': '#2d3b33',
          '--text': '#e4ebe6',
          '--muted': '#8fa096',
          '--accent': '#cbb086',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'dark-olive',
        variant: { en: 'Dark olive', zh: '橄榄暗绿' },
        vars: {
          '--bg': '#14160f',
          '--card': '#202319',
          '--card-active': '#2a2e21',
          '--border': '#3b402e',
          '--text': '#eae8d8',
          '--muted': '#a3a189',
          '--accent': '#c9bd86',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'sage',
        variant: { en: 'Sage', zh: '鼠尾草' },
        vars: {
          '--bg': '#1e2a23',
          '--card': '#28342c',
          '--card-active': '#313e35',
          '--border': '#44544a',
          '--text': '#e8f0ea',
          '--muted': '#a1ada2',
          '--accent': '#c9b98d',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'matcha',
        variant: { en: 'Matcha', zh: '抹茶' },
        vars: {
          '--bg': '#28331e',
          '--card': '#333f27',
          '--card-active': '#3d4a2f',
          '--border': '#51603f',
          '--text': '#eef2de',
          '--muted': '#adb694',
          '--accent': '#d0bd7a',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'grass',
        variant: { en: 'Grass', zh: '草绿' },
        vars: {
          '--bg': '#364427',
          '--card': '#415031',
          '--card-active': '#4c5c3b',
          '--border': '#60704b',
          '--text': '#f2f5e6',
          '--muted': '#b7bf9f',
          '--accent': '#d8c688',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
    ],
  },
  {
    id: 'yellow',
    name: { en: 'Yellow', zh: '黄色' },
    variants: [
      {
        id: 'mustard',
        variant: { en: 'Mustard', zh: '芥末' },
        vars: {
          '--bg': '#17140a',
          '--card': '#231e10',
          '--card-active': '#2c2614',
          '--border': '#443c1f',
          '--text': '#f0ecd8',
          '--muted': '#b0a884',
          '--accent': '#cbb04f',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'amber',
        variant: { en: 'Amber', zh: '琥珀' },
        vars: {
          '--bg': '#1a1206',
          '--card': '#281c0d',
          '--card-active': '#322412',
          '--border': '#4d3a1c',
          '--text': '#f4e9d6',
          '--muted': '#b69f80',
          '--accent': '#e0a95a',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'gilded',
        variant: { en: 'Gilded', zh: '鎏金' },
        vars: {
          '--bg': '#181207',
          '--card': '#261c0e',
          '--card-active': '#302313',
          '--border': '#4a3a1f',
          '--text': '#f3ead3',
          '--muted': '#b5a482',
          '--accent': '#e6c069',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'sand-gold',
        variant: { en: 'Sand gold', zh: '沙金' },
        vars: {
          '--bg': '#1b160c',
          '--card': '#2a2212',
          '--card-active': '#342b18',
          '--border': '#4f4426',
          '--text': '#f5eeda',
          '--muted': '#b8ac8b',
          '--accent': '#dcc27e',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'honey',
        variant: { en: 'Honey', zh: '蜂蜜' },
        vars: {
          '--bg': '#1c1407',
          '--card': '#2b1f0d',
          '--card-active': '#352713',
          '--border': '#503c1d',
          '--text': '#f5ecda',
          '--muted': '#b9a57f',
          '--accent': '#e2b060',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
      {
        id: 'bronze',
        variant: { en: 'Bronze', zh: '青铜' },
        vars: {
          '--bg': '#171008',
          '--card': '#251a0e',
          '--card-active': '#2f2213',
          '--border': '#4a371f',
          '--text': '#f2e7d5',
          '--muted': '#b29d80',
          '--accent': '#c89050',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
    ],
  },
  {
    id: 'white',
    name: { en: 'White', zh: '白色' },
    variants: [
      {
        id: 'snow',
        variant: { en: 'Snow', zh: '雪白' },
        vars: {
          '--bg': '#f6f6f4',
          '--card': '#ffffff',
          '--card-active': '#ffffff',
          '--border': '#e4e4df',
          '--text': '#232320',
          '--muted': '#7c7c74',
          '--accent': '#4b4b45',
          '--on-accent': '#f6f6f4',
          '--card-shadow': SHADOW_LIGHT,
          ...RATE_LIGHT,
        },
      },
      {
        id: 'ivory',
        variant: { en: 'Ivory', zh: '象牙' },
        vars: {
          '--bg': '#f5f1e6',
          '--card': '#fffdf5',
          '--card-active': '#fffef9',
          '--border': '#e2dcc9',
          '--text': '#2b271c',
          '--muted': '#857c66',
          '--accent': '#6f6242',
          '--on-accent': '#fbf7ee',
          '--card-shadow': SHADOW_LIGHT,
          ...RATE_LIGHT,
        },
      },
      {
        id: 'pearl',
        variant: { en: 'Pearl', zh: '珍珠' },
        vars: {
          '--bg': '#f3f1f0',
          '--card': '#fefdfc',
          '--card-active': '#ffffff',
          '--border': '#e3dfdc',
          '--text': '#2b2724',
          '--muted': '#847c76',
          '--accent': '#6b5f57',
          '--on-accent': '#faf8f7',
          '--card-shadow': SHADOW_LIGHT,
          ...RATE_LIGHT,
        },
      },
      {
        id: 'moon-white',
        variant: { en: 'Moon white', zh: '月白' },
        vars: {
          '--bg': '#eef2f3',
          '--card': '#fbfdfd',
          '--card-active': '#ffffff',
          '--border': '#d7dfe1',
          '--text': '#20282a',
          '--muted': '#73828a',
          '--accent': '#4a6068',
          '--on-accent': '#f1f5f6',
          '--card-shadow': SHADOW_LIGHT,
          ...RATE_LIGHT,
        },
      },
      {
        id: 'porcelain',
        variant: { en: 'Porcelain', zh: '瓷白' },
        vars: {
          '--bg': '#eef2ee',
          '--card': '#fbfdfb',
          '--card-active': '#ffffff',
          '--border': '#d7e0d8',
          '--text': '#20281f',
          '--muted': '#74836f',
          '--accent': '#4a6350',
          '--on-accent': '#f1f6f1',
          '--card-shadow': SHADOW_LIGHT,
          ...RATE_LIGHT,
        },
      },
      {
        id: 'bone',
        variant: { en: 'Bone', zh: '骨白' },
        vars: {
          '--bg': '#f1efe9',
          '--card': '#fbf9f4',
          '--card-active': '#fffefb',
          '--border': '#ded9cd',
          '--text': '#28251d',
          '--muted': '#827b6a',
          '--accent': '#635b46',
          '--on-accent': '#f8f6f1',
          '--card-shadow': SHADOW_LIGHT,
          ...RATE_LIGHT,
        },
      },
    ],
  },
]

/** Nav dot: a slice of the colour's first palette. */
function dotFor(c: ColorEntry): string {
  const v = c.variants[0].vars
  return `linear-gradient(135deg, ${v['--border']}, ${v['--accent']})`
}

/** Design presentation: a colour section — one nav entry per colour, each
 *  rendered as one full-width live preview per palette. "Default" follows the
 *  theme toggle and sits on an inverted backdrop. */
export default function DesignView() {
  const { lang, t } = useI18n()
  const theme = useResolvedTheme()
  const entries: ColorEntry[] = [
    {
      id: 'default',
      name: { en: 'Default', zh: '默认' },
      variants: [theme === 'dark' ? DARK_PALETTE : LIGHT_PALETTE],
    },
    ...COLOR_ENTRIES,
  ]

  const [activeId, setActiveId] = useState(entries[0].id)
  const active = entries.find((c) => c.id === activeId) ?? entries[0]
  const word = WORDS[0]

  const sidebar = (
    <>
      <h2>{t('design.colors')}</h2>
      {entries.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`navitem${c.id === activeId ? ' on' : ''}`}
          onClick={() => setActiveId(c.id)}
        >
          <span className="dot" style={{ background: dotFor(c) }} />
          {c.name[lang]}
        </button>
      ))}
    </>
  )

  return (
    <HomeShell panelClassName="panel-top" sidebar={sidebar}>
      <div
        className={`color-stack${active.variants.length > 1 ? ' multi' : ''}`}
      >
        {active.variants.map((v) => (
          <div
            className="color-view"
            key={v.id}
            style={v.vars as CSSProperties}
          >
            <div className="cv-name-row">
              <span className="cv-name">{v.variant[lang]}</span>
              <span className="cv-hex">{v.vars['--bg']}</span>
            </div>

            <div className="cv-swatches">
              {SWATCHES.map((s) => (
                <div className="cv-swatch" key={s.key}>
                  <span
                    className="chip"
                    style={{ background: `var(${s.key})` }}
                  />
                  <span className="cv-label">{s.label}</span>
                  <span className="cv-hex">{v.vars[s.key]}</span>
                </div>
              ))}
            </div>

            <div className="cv-stage">
              <div className="cv-card">
                <div className="cv-dots">
                  <span className="cv-dot r" />
                  <span className="cv-dot y" />
                  <span className="cv-dot g" />
                </div>
                <div className="cv-word">{word.word}</div>
                <div className="cv-phon">
                  {word.phonetic}
                  {word.senses[0]?.pos ? ` · ${word.senses[0].pos}` : ''}
                </div>
                <div className="cv-def">
                  {word.senses.map((s) => s.defs.join('；')).join('；')}
                </div>
              </div>

              <div className="cv-aside">
                <div className="cv-listrow">
                  <span>{word.word}</span>
                  <span>{word.senses[0]?.defs[0] ?? ''}</span>
                </div>
                <div className="cv-book">
                  <span className="cv-spine">
                    <i />
                    <b />
                  </span>
                  <span className="cv-bookmeta">62% / 34%</span>
                </div>
                <div className="cv-btns">
                  <span className="cv-btn r">
                    <kbd>1</kbd> {t('rating.unknown')}
                  </span>
                  <span className="cv-btn y">
                    <kbd>2</kbd> {t('rating.fuzzy')}
                  </span>
                  <span className="cv-btn g">
                    <kbd>3</kbd> {t('rating.known')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </HomeShell>
  )
}
