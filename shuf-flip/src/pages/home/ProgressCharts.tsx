import { useState, type CSSProperties } from 'react'
import { useI18n } from '../../i18n'
import { Chart } from './ResultCharts'
import './progressCharts.css'

/* ------------------------------------------------------------------ *
 * Demo progress data — languages × reveal status, a year of daily
 * study, a 30-day accumulation and level totals.
 * ------------------------------------------------------------------ */

type BurstCat = {
  key: string
  label: string
  children: { key: string; label: string; n: number }[]
}

/** Inner ring: language. Outer ring: how the word was revealed. */
const BURST: BurstCat[] = [
  {
    key: 'en',
    label: 'progress.lang.en',
    children: [
      { key: 'exposed', label: 'progress.status.exposed', n: 24 },
      { key: 'before', label: 'progress.status.revealedBefore', n: 31 },
      { key: 'today', label: 'progress.status.revealedToday', n: 9 },
    ],
  },
  {
    key: 'zh',
    label: 'progress.lang.zh',
    children: [
      { key: 'exposed', label: 'progress.status.exposed', n: 12 },
      { key: 'before', label: 'progress.status.revealedBefore', n: 18 },
      { key: 'today', label: 'progress.status.revealedToday', n: 5 },
    ],
  },
  {
    key: 'ja',
    label: 'progress.lang.ja',
    children: [
      { key: 'exposed', label: 'progress.status.exposed', n: 16 },
      { key: 'before', label: 'progress.status.revealedBefore', n: 20 },
      { key: 'today', label: 'progress.status.revealedToday', n: 7 },
    ],
  },
]

/** Three solid tones per language: exposed → before → today. */
const SHADES: Record<string, [string, string, string]> = {
  en: ['#bdf3c9', '#8fdca0', '#4fb26e'],
  zh: ['#f7e6ad', '#e6c877', '#c39f3d'],
  ja: ['#bcd8ec', '#7fb3d5', '#4e86ab'],
}

const SUN_TOTAL = BURST.reduce(
  (sum, c) => sum + c.children.reduce((s, x) => s + x.n, 0),
  0,
)

/** Lay the two rings out once — angles only depend on the static data. */
const SUN = (() => {
  let a = 0
  return BURST.map((c) => {
    const total = c.children.reduce((s, x) => s + x.n, 0)
    const a0 = a
    const a1 = a + (total / SUN_TOTAL) * 360
    a = a1
    let ca = a0
    const children = c.children.map((x, i) => {
      const c0 = ca
      const c1 = ca + (x.n / total) * (a1 - a0)
      ca = c1
      return { ...x, a0: c0, a1: c1, i }
    })
    return { ...c, total, a0, a1, children }
  })
})()

/** Deterministic pseudo-random daily levels for the calendar. */
const CAL_WEEKS = 17
const CAL_DAYS = 7
const CAL_LEVELS = (() => {
  let s = 20243
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
  return Array.from({ length: CAL_WEEKS * CAL_DAYS }, () => {
    const r = rnd()
    return r < 0.18 ? 0 : 1 + Math.floor(rnd() * 4)
  })
})()

/** Cumulative words learned over 30 days (monotonically rising). */
const GROWTH = (() => {
  let max = 0
  return Array.from({ length: 30 }, (_, i) => {
    const v = 5 + i * 5 + Math.sin(i / 2) * 4 + i * i * 0.05
    max = Math.max(max, v)
    return Math.round(max)
  })
})()

const MASTERY = [
  { key: 'results.new', n: 28, color: '#7fb3d5' },
  { key: 'progress.stage.learning', n: 20, color: '#8fdca0' },
  { key: 'progress.stage.familiar', n: 16, color: '#e6c877' },
  { key: 'progress.stage.mastered', n: 8, color: '#e39a5c' },
]
const MASTERY_TOTAL = MASTERY.reduce((s, m) => s + m.n, 0)

/* ---- geometry helpers ---- */

/** angle 0 = 12 o'clock, clockwise. */
function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const
}

/** Open arc at radius r, a0 → a1 degrees (drawn as a stroked path). */
function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const [x0, y0] = polar(cx, cy, r, a0)
  const [x1, y1] = polar(cx, cy, r, a1)
  const large = a1 - a0 > 180 ? 1 : 0
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`
}

/** Filled annular sector — the pie wedge when r0 is 0. */
function sectorPath(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
) {
  const [x0o, y0o] = polar(cx, cy, r1, a0)
  const [x1o, y1o] = polar(cx, cy, r1, a1)
  const [x1i, y1i] = polar(cx, cy, r0, a1)
  const [x0i, y0i] = polar(cx, cy, r0, a0)
  const large = a1 - a0 > 180 ? 1 : 0
  return `M ${x0o} ${y0o} A ${r1} ${r1} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${r0} ${r0} 0 ${large} 0 ${x0i} ${y0i} Z`
}

/** Unit outward nudge for a segment at mid-angle `mid`. */
function outward(mid: number, dist: number) {
  const [ox, oy] = polar(0, 0, dist, mid)
  return { '--ox': `${ox}px`, '--oy': `${oy}px` }
}

/** Soft same-colour glow for a segment (borrowed from the composition pie). */
function glow(color: string) {
  return { '--glow': `${color}66` } as CSSProperties
}

/* ------------------------------------------------------------------ *
 * Charts
 * ------------------------------------------------------------------ */

type Active = { label: string; n: number; cat: string; stage?: string }

/** Centre readout — HTML so it stays optically centred in the hole. */
function Center({ active }: { active: Active | null }) {
  const { t } = useI18n()
  return (
    <div className="pb-center">
      <b className="pb-num">{active ? active.n : SUN_TOTAL}</b>
      <span className="pb-cap">
        {active ? active.label : t('progress.words')}
      </span>
    </div>
  )
}

/** Nested legend shared by the sunbursts. */
function Legend() {
  const { t } = useI18n()
  return (
    <ul className="pb-legend">
      {SUN.map((c) => (
        <li key={c.key}>
          <div className="pb-leg-row">
            <i style={{ background: SHADES[c.key][1] }} />
            <span>{t(c.label)}</span>
            <b>{c.total}</b>
          </div>
          <ul className="pb-leg-sub">
            {c.children.map((x) => (
              <li key={x.key}>
                <i style={{ background: SHADES[c.key][x.i] }} />
                <span>{t(x.label)}</span>
                <b>{x.n}</b>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}

/** 01 — Sunburst: segmented rings, language inside, status outside. */
function Sunburst() {
  const { t } = useI18n()
  const [active, setActive] = useState<Active | null>(null)
  const S = 340
  const C = S / 2
  const R_IN = 82
  const R_OUT = 128
  const W_IN = 34
  const W_OUT = 30
  const GAP = 1.8

  return (
    <div className="rc rc-pburst">
      <div className="pb-dial">
        <svg viewBox={`0 0 ${S} ${S}`} className="pb-sun" aria-hidden="true">
          <circle className="pb-track" cx={C} cy={C} r={R_IN} strokeWidth={W_IN} />
          <circle className="pb-track" cx={C} cy={C} r={R_OUT} strokeWidth={W_OUT} />
          {SUN.map((c) => {
            const catDim = active && active.cat !== c.key
            return (
              <g key={c.key} className={catDim ? 'dim' : ''}>
                <path
                  className="pb-arc"
                  pathLength={1}
                  d={arc(C, C, R_IN, c.a0 + GAP, c.a1 - GAP)}
                  stroke={SHADES[c.key][1]}
                  strokeWidth={W_IN}
                  style={glow(SHADES[c.key][1])}
                  onMouseEnter={() =>
                    setActive({ label: t(c.label), n: c.total, cat: c.key })
                  }
                  onMouseLeave={() => setActive(null)}
                />
                {c.children.map((x) => {
                  const dim =
                    active &&
                    (active.cat !== c.key ||
                      (active.stage && active.stage !== x.key))
                  return (
                    <path
                      key={x.key}
                      className={`pb-arc${dim ? ' dim' : ''}`}
                      pathLength={1}
                      d={arc(C, C, R_OUT, x.a0 + GAP, x.a1 - GAP)}
                      stroke={SHADES[c.key][x.i]}
                      strokeWidth={W_OUT}
                      style={glow(SHADES[c.key][x.i])}
                      onMouseEnter={() =>
                        setActive({
                          label: t(x.label),
                          n: x.n,
                          cat: c.key,
                          stage: x.key,
                        })
                      }
                      onMouseLeave={() => setActive(null)}
                    />
                  )
                })}
              </g>
            )
          })}
          <circle className="pb-hole" cx={C} cy={C} r={55} />
        </svg>
        <Center active={active} />
      </div>
      <Legend />
    </div>
  )
}

/** 05 — Linked sunburst, filled: hovering a slice slides its whole branch
 *  (the parent and its children) outward together. */
function LinkedSunburst() {
  const { t } = useI18n()
  const [active, setActive] = useState<Active | null>(null)
  const S = 340
  const C = S / 2
  const R0 = 44
  const R1 = 90
  const R2 = 132

  return (
    <div className="rc rc-pburst">
      <div className="pb-dial">
        <svg viewBox={`0 0 ${S} ${S}`} className="pb-sun" aria-hidden="true">
          {SUN.map((c) => {
            const catDim = active && active.cat !== c.key
            return (
              <g key={c.key} className={catDim ? 'dim' : ''}>
                <g
                  className={`pb-slot${active?.cat === c.key ? ' move' : ''}`}
                  style={outward((c.a0 + c.a1) / 2, 7) as CSSProperties}
                  onMouseEnter={() =>
                    setActive({ label: t(c.label), n: c.total, cat: c.key })
                  }
                  onMouseLeave={() => setActive(null)}
                >
                  <path
                    className="pb-fill"
                    fill={SHADES[c.key][1]}
                    style={glow(SHADES[c.key][1])}
                    d={sectorPath(C, C, R0, R1, c.a0 + 1.4, c.a1 - 1.4)}
                  />
                </g>
                {c.children.map((x) => {
                  const dim =
                    active &&
                    (active.cat !== c.key ||
                      (active.stage && active.stage !== x.key))
                  return (
                    <g
                      key={x.key}
                      className={`pb-slot${dim ? ' dim' : ''}${
                        active?.cat === c.key &&
                        (!active.stage || active.stage === x.key)
                          ? ' move'
                          : ''
                      }`}
                      style={outward((x.a0 + x.a1) / 2, 9) as CSSProperties}
                      onMouseEnter={() =>
                        setActive({
                          label: t(x.label),
                          n: x.n,
                          cat: c.key,
                          stage: x.key,
                        })
                      }
                      onMouseLeave={() => setActive(null)}
                    >
                      <path
                        className="pb-fill"
                        fill={SHADES[c.key][x.i]}
                        style={glow(SHADES[c.key][x.i])}
                        d={sectorPath(C, C, R1 + 4, R2, x.a0 + 1.4, x.a1 - 1.4)}
                      />
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
        <Center active={active} />
      </div>
      <Legend />
    </div>
  )
}

/** 06 — Linked sunburst, rings: the same linking on segmented arcs. Hover is
 *  tracked by a static hit layer, so the gap between the rings (and between
 *  segments) never drops the state — the ring gap counts as the outer ring. */
function RingSunburst() {
  const { t } = useI18n()
  const [active, setActive] = useState<Active | null>(null)
  const S = 340
  const C = S / 2
  const R_IN = 82
  const R_OUT = 128
  const W_IN = 34
  const W_OUT = 30
  const GAP = 1.8
  const MID = R_IN + W_IN / 2 // inner ring's outer edge — the gap starts here
  const OUT_EDGE = R_OUT + W_OUT / 2

  return (
    <div className="rc rc-pburst">
      <div className="pb-dial" onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${S} ${S}`} className="pb-sun" aria-hidden="true">
          <circle className="pb-track" cx={C} cy={C} r={R_IN} strokeWidth={W_IN} />
          <circle className="pb-track" cx={C} cy={C} r={R_OUT} strokeWidth={W_OUT} />

          {/* visual layer — the parts that move on hover */}
          {SUN.map((c) => {
            const catDim = active && active.cat !== c.key
            return (
              <g key={c.key} className={catDim ? 'dim' : ''}>
                <g
                  className={`pb-slot${active?.cat === c.key ? ' move' : ''}`}
                  style={outward((c.a0 + c.a1) / 2, 6) as CSSProperties}
                >
                  <path
                    className="pb-arc"
                    pathLength={1}
                    d={arc(C, C, R_IN, c.a0 + GAP, c.a1 - GAP)}
                    stroke={SHADES[c.key][1]}
                    strokeWidth={W_IN}
                    style={glow(SHADES[c.key][1])}
                  />
                </g>
                {c.children.map((x) => {
                  const dim =
                    active &&
                    (active.cat !== c.key ||
                      (active.stage && active.stage !== x.key))
                  return (
                    <g
                      key={x.key}
                      className={`pb-slot${dim ? ' dim' : ''}${
                        active?.cat === c.key &&
                        (!active.stage || active.stage === x.key)
                          ? ' move'
                          : ''
                      }`}
                      style={outward((x.a0 + x.a1) / 2, 8) as CSSProperties}
                    >
                      <path
                        className="pb-arc"
                        pathLength={1}
                        d={arc(C, C, R_OUT, x.a0 + GAP, x.a1 - GAP)}
                        stroke={SHADES[c.key][x.i]}
                        strokeWidth={W_OUT}
                        style={glow(SHADES[c.key][x.i])}
                      />
                    </g>
                  )
                })}
              </g>
            )
          })}

          {/* static hit layer — outer sectors reach inward across the gap */}
          {SUN.map((c) => (
            <g key={`${c.key}-hit`}>
              <path
                className="pb-hit"
                d={sectorPath(C, C, R_IN - W_IN / 2, MID, c.a0 + GAP, c.a1 - GAP)}
                onMouseEnter={() =>
                  setActive({ label: t(c.label), n: c.total, cat: c.key })
                }
              />
              {c.children.map((x) => (
                <path
                  key={x.key}
                  className="pb-hit"
                  d={sectorPath(C, C, MID, OUT_EDGE, x.a0 + GAP, x.a1 - GAP)}
                  onMouseEnter={() =>
                    setActive({
                      label: t(x.label),
                      n: x.n,
                      cat: c.key,
                      stage: x.key,
                    })
                  }
                />
              ))}
            </g>
          ))}
        </svg>
        <Center active={active} />
      </div>
      <Legend />
    </div>
  )
}

/** 02 — Calendar: a year of study, one heat cell per day. */
function Calendar() {
  const { t } = useI18n()
  const CELL = 20
  const GAP = 5
  const w = CAL_WEEKS * (CELL + GAP) - GAP
  const h = CAL_DAYS * (CELL + GAP) - GAP
  return (
    <div className="rc rc-pcal">
      <div className="pc-wrap">
        <svg viewBox={`0 0 ${w} ${h}`} className="pc-cal" aria-hidden="true">
          {CAL_LEVELS.map((lv, i) => (
            <rect
              key={i}
              className={`pc-cell pc-l${lv}`}
              x={Math.floor(i / CAL_DAYS) * (CELL + GAP)}
              y={(i % CAL_DAYS) * (CELL + GAP)}
              width={CELL}
              height={CELL}
              rx={4}
            />
          ))}
        </svg>
        <div className="pc-legend">
          <span>{t('progress.less')}</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <i key={l} className={`pc-l${l}`} />
          ))}
          <span>{t('progress.more')}</span>
        </div>
      </div>
      <div className="pc-stat">
        <b className="rc-big">184</b>
        <span className="rc-cap">{t('progress.days')}</span>
      </div>
    </div>
  )
}

/** 03 — Growth: cumulative words learned, day by day. */
function Growth() {
  const { t } = useI18n()
  const W = 700
  const H = 320
  const PX = 44
  const PY = 36
  const max = GROWTH[GROWTH.length - 1]
  const x = (i: number) => PX + (i / (GROWTH.length - 1)) * (W - 2 * PX)
  const y = (v: number) => H - PY - (v / max) * (H - 2 * PY)
  const line = GROWTH.map((v, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(v)}`).join(' ')
  const area = `${line} L ${x(GROWTH.length - 1)} ${H - PY} L ${x(0)} ${H - PY} Z`

  return (
    <div className="rc rc-pgrowth">
      <div className="pg-head">
        <span className="rc-big">{max}</span>
        <span className="rc-cap">{t('results.studied')}</span>
        <span className="pg-streak">12 · {t('results.streak')}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="pg-svg" aria-hidden="true">
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            className="rc-gridline"
            x1={PX}
            x2={W - PX}
            y1={H - PY - f * (H - 2 * PY)}
            y2={H - PY - f * (H - 2 * PY)}
          />
        ))}
        <path className="pg-area" d={area} />
        <path className="pg-line" d={line} pathLength={1} />
        {GROWTH.map((v, i) =>
          i % 5 === 0 || i === GROWTH.length - 1 ? (
            <circle key={i} className="pg-pt" cx={x(i)} cy={y(v)} r={3.2} />
          ) : null,
        )}
      </svg>
    </div>
  )
}

/** 04 — Mastery rings: how the vocabulary spreads across levels. */
function Mastery() {
  const { t } = useI18n()
  const S = 300
  const C = S / 2
  return (
    <div className="rc rc-pmastery">
      <svg viewBox={`0 0 ${S} ${S}`} className="pm-svg" aria-hidden="true">
        {MASTERY.map((m, i) => {
          const r = 44 + i * 27
          const pct = (m.n / MASTERY_TOTAL) * 100
          return (
            <g key={m.key} transform={`rotate(-90 ${C} ${C})`}>
              <circle className="pm-track" cx={C} cy={C} r={r} />
              <circle
                className="pm-arc"
                cx={C}
                cy={C}
                r={r}
                stroke={m.color}
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100 - pct}
                style={{ animationDelay: `${i * 120}ms` } as CSSProperties}
              />
            </g>
          )
        })}
        <text className="pm-num" x={C} y={C - 2} textAnchor="middle">
          {MASTERY_TOTAL}
        </text>
        <text className="pm-cap" x={C} y={C + 16} textAnchor="middle">
          {t('progress.words')}
        </text>
      </svg>
      <ul className="pm-legend">
        {MASTERY.map((m) => (
          <li key={m.key}>
            <i style={{ background: m.color }} />
            <span>{t(m.key)}</span>
            <b>{m.n}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Creative: progress-page chart concepts. */
export default function ProgressCharts() {
  const { t } = useI18n()
  return (
    <div className="charts">
      <Chart
        label={`01 · ${t('progress.chart.sunburst')}`}
        caption={t('progress.chart.cap.sunburst')}
      >
        <Sunburst />
      </Chart>
      <Chart
        label={`02 · ${t('progress.chart.calendar')}`}
        caption={t('progress.chart.cap.calendar')}
      >
        <Calendar />
      </Chart>
      <Chart
        label={`03 · ${t('progress.chart.growth')}`}
        caption={t('progress.chart.cap.growth')}
      >
        <Growth />
      </Chart>
      <Chart
        label={`04 · ${t('progress.chart.mastery')}`}
        caption={t('progress.chart.cap.mastery')}
      >
        <Mastery />
      </Chart>
      <Chart
        label={`05 · ${t('progress.chart.linked')}`}
        caption={t('progress.chart.cap.linked')}
      >
        <LinkedSunburst />
      </Chart>
      <Chart
        label={`06 · ${t('progress.chart.rings')}`}
        caption={t('progress.chart.cap.rings')}
      >
        <RingSunburst />
      </Chart>
    </div>
  )
}
