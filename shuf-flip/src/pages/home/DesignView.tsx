import { useState } from 'react'
import type { CSSProperties } from 'react'
import HomeShell from './HomeShell'
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

// One entry per colour, each with one or more palettes.
// Light / dark are the app's current themes; reds are sampled from
// docs/preview/dark.html (R2 酒红墨, R3 玫瑰木, R10 砖红夜).
const COLORS: ColorEntry[] = [
  {
    id: 'light',
    name: { en: 'Light', zh: '浅色' },
    variants: [
      {
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
      },
    ],
  },
  {
    id: 'dark',
    name: { en: 'Dark', zh: '深色' },
    variants: [
      {
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
      },
    ],
  },
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
        id: 'brick-night',
        variant: { en: 'Brick night', zh: '砖红夜' },
        vars: {
          '--bg': '#1c110d',
          '--card': '#2b1a14',
          '--card-active': '#36221a',
          '--border': '#523428',
          '--text': '#f5e8e1',
          '--muted': '#b79b8d',
          '--accent': '#dda687',
          '--on-accent': '#221b10',
          '--card-shadow': SHADOW_DARK,
          ...RATE_DARK,
        },
      },
    ],
  },
]

/** Nav dot: a slice of the colour's first palette. */
function dotFor(c: ColorEntry): string {
  const v = c.variants[0].vars
  return `linear-gradient(135deg, ${v['--bg']}, ${v['--border']})`
}

/** Design presentation: a colour section — one nav entry per colour, each
 *  rendered as one full-width live preview per palette, stacked top to bottom. */
export default function DesignView() {
  const { lang, t } = useI18n()
  const [activeId, setActiveId] = useState(COLORS[0].id)
  const active = COLORS.find((c) => c.id === activeId) ?? COLORS[0]
  const word = WORDS[0]

  const sidebar = (
    <>
      <h2>{t('design.colors')}</h2>
      {COLORS.map((c) => (
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
      <div className="color-stack">
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
