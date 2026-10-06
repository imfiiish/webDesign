import { useState, type CSSProperties, type ReactNode } from 'react'
import { useI18n, type Lang } from '../../i18n'
import { BOOKS, LANGS, type Book, type LangId } from '../books/data'
import './wordbooksLab.css'

type T = (key: string) => string

const fmt = (n: number) => n.toLocaleString('en-US')
const pctOf = (b: Book) => Math.round((b.learned / b.total) * 100)
const PACE = 25

/** One accent per language, kept inside the forest palette. */
const LANG_COLOR: Record<LangId, string> = {
  en: '#8fdca0',
  zh: '#c9bb8e',
  ja: '#d98b7a',
  ko: '#8fa9c9',
}

function Tick() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

/** Everything a left-panel take needs, resolved once and shared. */
type Pick = {
  lang: Lang
  picked: Book
  saved: number
  effective: number
  cut: string[]
  toggle: (id: string) => void
  nameById: (id: string) => string
}

/** The little identity strip every take opens with. */
function PanelHead({ p, t }: { p: Pick; t: T }) {
  const b = p.picked
  return (
    <header className="wb-head">
      <span
        className="wb-chip"
        style={{ background: LANG_COLOR[b.lang] }}
        aria-hidden="true"
      />
      <div className="wb-head-id">
        <span className="wb-kicker">{t('books.current')}</span>
        <h4 className="wb-name">{b.name[p.lang]}</h4>
        <span className="wb-sub">
          {fmt(b.total)} {t('books.words')}
        </span>
      </div>
      <span className="wb-pct">{pctOf(b)}%</span>
    </header>
  )
}

/** The trim checklist, shared by every take. */
function TrimList({ p, t }: { p: Pick; t: T }) {
  const cands = p.picked.excludes ?? []
  if (!cands.length) return <p className="wb-empty">{t('books.noTrim')}</p>
  return (
    <ul className="wb-trims">
      {cands.map((c) => {
        const on = p.cut.includes(c.id)
        return (
          <li key={c.id}>
            <button
              type="button"
              className={`wb-trim${on ? ' on' : ''}`}
              aria-pressed={on}
              onClick={() => p.toggle(c.id)}
            >
              <span className="wb-tick" aria-hidden="true">
                {on ? <Tick /> : null}
              </span>
              <span className="wb-trim-name">{p.nameById(c.id)}</span>
              <span className="wb-trim-cut">−{fmt(c.covers)}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** The segmented capacity bar: learned, excluded, then what is left. */
function CapacityBar({
  p,
  showCut = true,
}: {
  p: Pick
  showCut?: boolean
}) {
  const total = p.picked.total
  return (
    <div className="wb-cap" aria-hidden="true">
      <span
        className="wb-seg wb-seg-learned"
        style={{ width: `${(p.picked.learned / total) * 100}%` }}
      />
      {showCut && (
        <span
          className="wb-seg wb-seg-cut"
          style={{ width: `${(p.saved / total) * 100}%` }}
        />
      )}
    </div>
  )
}

/** One bench row: a numbered caption above the stage the take sits in. */
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
    <section className="wb-idea">
      <header className="wb-idea-head">
        <span className="wb-idea-no">{no}</span>
        <h3 className="wb-idea-label">{label}</h3>
      </header>
      <div className="wb-stage">{children}</div>
    </section>
  )
}

/* ---- the takes ---- */

/** 01 — Capacity. The shipping Index panel. */
function TakeCapacity({ p, t }: { p: Pick; t: T }) {
  return (
    <div className="wb-panel">
      <PanelHead p={p} t={t} />
      <div className="wb-cap-block">
        <CapacityBar p={p} />
        <div className="wb-legend">
          <span className="wb-leg">
            <i className="wb-dot wb-dot-learned" />
            {t('books.index.learned')} <b>{fmt(p.picked.learned)}</b>
          </span>
          <span className="wb-leg">
            <i className="wb-dot wb-dot-cut" />
            {t('books.index.excluded')} <b>{fmt(p.saved)}</b>
          </span>
          <span className="wb-leg">
            <i className="wb-dot wb-dot-left" />
            {t('books.index.effective')}{' '}
            <b style={{ color: LANG_COLOR[p.picked.lang] }}>
              {fmt(p.effective)}
            </b>
          </span>
        </div>
      </div>
      <div className="wb-result">
        <span className="wb-result-num" style={{ color: LANG_COLOR[p.picked.lang] }}>
          {fmt(p.effective)}
        </span>
        <span className="wb-result-unit">{t('books.words')}</span>
        <span className="wb-result-pace">
          {t('books.index.pace')}{' '}
          <b>{Math.ceil(p.effective / PACE)}</b> {t('books.index.days')}
        </span>
      </div>
      <TrimList p={p} t={t} />
    </div>
  )
}

/** 02 — Before / after. Two bars and the words the exclusions take out. */
function TakeSplit({ p, t }: { p: Pick; t: T }) {
  return (
    <div className="wb-panel">
      <PanelHead p={p} t={t} />
      <div className="wb-split">
        <div className="wb-split-row">
          <span className="wb-split-cap">
            {t('wb.total')} <b>{fmt(p.picked.total)}</b>
          </span>
          <CapacityBar p={p} />
        </div>
        <div className={`wb-split-drop${p.saved ? ' on' : ''}`}>
          <span className="wb-split-arrow" aria-hidden="true">
            ↓
          </span>
          {t('books.index.excluded')} −{fmt(p.saved)}
        </div>
        <div className="wb-split-row">
          <span className="wb-split-cap">
            {t('books.index.effective')} <b>{fmt(p.effective)}</b>
          </span>
          <CapacityBar p={p} showCut={false} />
        </div>
      </div>
      <TrimList p={p} t={t} />
    </div>
  )
}

/** 03 — Gauge. The effective share as a ring; learned and excluded arcs. */
function TakeGauge({ p, t }: { p: Pick; t: T }) {
  const total = p.picked.total
  const R = 54
  const C = 2 * Math.PI * R
  const learned = p.picked.learned / total
  const cut = p.saved / total
  const accent = LANG_COLOR[p.picked.lang]
  return (
    <div className="wb-panel wb-panel-center">
      <PanelHead p={p} t={t} />
      <div className="wb-gauge">
        <svg viewBox="0 0 132 132" className="wb-gauge-svg" aria-hidden="true">
          <circle className="wb-gauge-track" cx="66" cy="66" r={R} />
          <circle
            className="wb-gauge-arc"
            cx="66"
            cy="66"
            r={R}
            style={{ stroke: accent }}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - learned)}
            transform="rotate(-90 66 66)"
          />
          <circle
            className="wb-gauge-arc wb-gauge-arc-cut"
            cx="66"
            cy="66"
            r={R}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - cut)}
            transform={`rotate(${learned * 360 - 90} 66 66)`}
          />
        </svg>
        <div className="wb-gauge-center">
          <b className="wb-gauge-num" style={{ color: accent }}>
            {fmt(p.effective)}
          </b>
          <span className="wb-gauge-cap">{t('books.index.effective')}</span>
        </div>
      </div>
      <div className="wb-legend wb-legend-center">
        <span className="wb-leg">
          <i className="wb-dot wb-dot-learned" />
          {t('books.index.learned')} <b>{fmt(p.picked.learned)}</b>
        </span>
        <span className="wb-leg">
          <i className="wb-dot wb-dot-cut" />
          {t('books.index.excluded')} <b>{fmt(p.saved)}</b>
        </span>
      </div>
      <TrimList p={p} t={t} />
    </div>
  )
}

/** 04 — Stat tiles. Four numbers first, the bar as their footnote. */
function TakeStats({ p, t }: { p: Pick; t: T }) {
  const total = p.picked.total
  return (
    <div className="wb-panel">
      <PanelHead p={p} t={t} />
      <div className="wb-stats">
        <div className="wb-stat">
          <span>{t('wb.total')}</span>
          <b>{fmt(total)}</b>
        </div>
        <div className="wb-stat">
          <span>{t('books.index.learned')}</span>
          <b>{fmt(p.picked.learned)}</b>
        </div>
        <div className="wb-stat">
          <span>{t('books.index.excluded')}</span>
          <b>−{fmt(p.saved)}</b>
        </div>
        <div className="wb-stat wb-stat-hi">
          <span>{t('books.index.effective')}</span>
          <b style={{ color: LANG_COLOR[p.picked.lang] }}>
            {fmt(p.effective)}
          </b>
        </div>
      </div>
      <CapacityBar p={p} />
      <TrimList p={p} t={t} />
    </div>
  )
}

/** 05 — Spine. The effective amount as a vertical fill, like a bookmark. */
function TakeSpine({ p, t }: { p: Pick; t: T }) {
  const total = p.picked.total
  const fill = Math.max(0, Math.min(1, p.effective / total))
  const accent = LANG_COLOR[p.picked.lang]
  return (
    <div className="wb-panel">
      <PanelHead p={p} t={t} />
      <div className="wb-spine-wrap">
        <div className="wb-spine" aria-hidden="true">
          <span
            className="wb-spine-fill"
            style={{ height: `${fill * 100}%`, background: accent }}
          />
        </div>
        <div className="wb-spine-side">
          <span className="wb-spine-cap">{t('books.index.effective')}</span>
          <b className="wb-spine-num" style={{ color: accent }}>
            {fmt(p.effective)}
          </b>
          <span className="wb-spine-foot">
            {t('wb.total')} {fmt(total)} · −{fmt(p.saved)}
          </span>
          <div className="wb-spine-legend">
            <span className="wb-leg">
              <i className="wb-dot wb-dot-learned" />
              {t('books.index.learned')} <b>{fmt(p.picked.learned)}</b>
            </span>
          </div>
        </div>
      </div>
      <TrimList p={p} t={t} />
    </div>
  )
}

/** 06 — Checklist first. The exclusions are the panel; the sum rides on top. */
function TakeLedger({ p, t }: { p: Pick; t: T }) {
  const accent = LANG_COLOR[p.picked.lang]
  return (
    <div className="wb-panel">
      <div className="wb-ledger-top">
        <PanelHead p={p} t={t} />
        <div className="wb-ledger-sum">
          <b style={{ color: accent }}>{fmt(p.effective)}</b>
          <span>{t('books.words')}</span>
          {p.saved > 0 && (
            <em className="wb-ledger-delta">−{fmt(p.saved)}</em>
          )}
        </div>
      </div>
      <TrimList p={p} t={t} />
      <div className="wb-ledger-eq">
        {fmt(p.picked.total)} − {fmt(p.saved)} = <b>{fmt(p.effective)}</b>
      </div>
    </div>
  )
}

/** Creative bench for the Wordbooks left panel. One picker up top, then six
 *  takes on the same panel — every take shares the picked book and the
 *  exclusions, so a toggle updates all of them at once. */
export default function WordbooksLab() {
  const { lang, t } = useI18n()
  const [tab, setTab] = useState<LangId>('en')
  const [pickedId, setPickedId] = useState('en-cet4')
  const [cut, setCut] = useState<string[]>([])

  const list = BOOKS.filter((b) => b.lang === tab)
  const picked = BOOKS.find((b) => b.id === pickedId) ?? list[0]

  const pickLang = (id: LangId) => {
    setTab(id)
    setCut([])
    const first = BOOKS.find((b) => b.lang === id)
    if (first) setPickedId(first.id)
  }

  const toggle = (id: string) =>
    setCut((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))

  if (!picked) return null

  const saved = (picked.excludes ?? [])
    .filter((c) => cut.includes(c.id))
    .reduce((sum, c) => sum + c.covers, 0)
  const effective = Math.max(0, picked.total - saved)

  const p: Pick = {
    lang,
    picked,
    saved,
    effective,
    cut,
    toggle,
    nameById: (id) => {
      const b = BOOKS.find((x) => x.id === id)
      return b ? b.name[lang] : id
    },
  }

  return (
    <div className="wb-lab">
      <div className="wb-picker">
        <div className="wb-picker-head">
          <span className="wb-picker-title">{t('wb.pick')}</span>
          <div className="wb-langs" role="tablist" aria-label={t('books.title')}>
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={tab === l.id}
                className={`wb-lang${tab === l.id ? ' on' : ''}`}
                onClick={() => pickLang(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="wb-chips">
          {list.map((b) => {
            const on = b.id === pickedId
            return (
              <button
                key={b.id}
                type="button"
                className={`wb-chip-btn${on ? ' on' : ''}`}
                aria-pressed={on}
                style={{ '--accent-lang': LANG_COLOR[b.lang] } as CSSProperties}
                onClick={() => {
                  setPickedId(b.id)
                  setCut([])
                }}
              >
                <span className="wb-chip-name">{b.name[lang]}</span>
                <span className="wb-chip-meta">
                  {fmt(b.total)} · {pctOf(b)}%
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="wb-ideas">
        <Idea no="01" label={t('wb.idea.capacity')}>
          <TakeCapacity p={p} t={t} />
        </Idea>
        <Idea no="02" label={t('wb.idea.split')}>
          <TakeSplit p={p} t={t} />
        </Idea>
        <Idea no="03" label={t('wb.idea.gauge')}>
          <TakeGauge p={p} t={t} />
        </Idea>
        <Idea no="04" label={t('wb.idea.stats')}>
          <TakeStats p={p} t={t} />
        </Idea>
        <Idea no="05" label={t('wb.idea.spine')}>
          <TakeSpine p={p} t={t} />
        </Idea>
        <Idea no="06" label={t('wb.idea.ledger')}>
          <TakeLedger p={p} t={t} />
        </Idea>
      </div>
    </div>
  )
}
