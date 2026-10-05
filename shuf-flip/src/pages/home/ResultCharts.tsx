import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useI18n } from '../../i18n'
import './resultCharts.css'

type T = (key: string) => string

/* ------------------------------------------------------------------ *
 * Shared demo session, used by the Creative gallery below.
 * The Halo / Pace / GoalGauge components themselves are data-agnostic
 * and are reused by the real Flip · Results scene.
 * ------------------------------------------------------------------ */

const SAMPLE = {
  studied: 12,
  newWords: 7,
  reviewWords: 5,
  exposed: 9,
  reveals: 27,
}

type Word = { w: string; n: number; kind: 'new' | 'review' }

const WORDS: Word[] = [
  { w: 'abandon', n: 1, kind: 'new' },
  { w: 'benevolent', n: 3, kind: 'review' },
  { w: 'candid', n: 2, kind: 'new' },
  { w: 'diligent', n: 4, kind: 'review' },
  { w: 'eloquent', n: 1, kind: 'new' },
  { w: 'frugal', n: 2, kind: 'new' },
  { w: 'genuine', n: 1, kind: 'new' },
  { w: 'humble', n: 2, kind: 'review' },
  { w: 'lucid', n: 3, kind: 'new' },
  { w: 'meticulous', n: 5, kind: 'review' },
  { w: 'resilient', n: 2, kind: 'new' },
  { w: 'vivid', n: 1, kind: 'review' },
]

/** Demo rounds for the Creative dual combo (one entry per round). */
const SAMPLE_ROUNDS = [
  { e: 8, r: 12 },
  { e: 10, r: 18 },
  { e: 12, r: 26 },
  { e: 9, r: 15 },
  { e: 12, r: 30 },
  { e: 11, r: 22 },
  { e: 12, r: 28 },
  { e: 10, r: 19 },
]

const MAX_N = 5
const TOTAL = SAMPLE.studied + SAMPLE.exposed

/** angle 0 = 12 o'clock, clockwise. */
function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const
}

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const [x0, y0] = polar(cx, cy, r, a0)
  const [x1, y1] = polar(cx, cy, r, a1)
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`
}

/** Filled pie wedge from a0 to a1 (degrees, 0 = 12 o'clock). */
function wedgePath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const [x0, y0] = polar(cx, cy, r, a0)
  const [x1, y1] = polar(cx, cy, r, a1)
  const large = a1 - a0 > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`
}

/** Split new / review / exposure into pie slices (cumulative counts). */
function slicesOf(newWords: number, reviewWords: number, exposed: number) {
  const total = newWords + reviewWords + exposed || 1
  const parts = [
    { key: 'new', n: newWords },
    { key: 'review', n: reviewWords },
    { key: 'exposed', n: exposed },
  ] as const
  let acc = 0
  return parts.map((p) => {
    const frac = p.n / total
    const a0 = acc * 360
    const a1 = (acc + frac) * 360
    acc += frac
    return { ...p, frac, a0, a1, mid: (a0 + a1) / 2 }
  })
}

/* ================================================================== *
 * Reusable chart bodies (no outer chrome — callers supply a panel).
 * ================================================================== */

/** Cumulative reveals across the round. `steps` = reveals per card, in order. */
export function Pace({ steps }: { steps: number[] }) {
  const { t } = useI18n()
  const W = 720
  const H = 200
  const PX = 28
  const PY = 24

  const cumulative: number[] = []
  steps.reduce((acc, n) => {
    const v = acc + n
    cumulative.push(v)
    return v
  }, 0)
  if (cumulative.length === 0) cumulative.push(0)

  const n = cumulative.length
  const denom = Math.max(1, n - 1)
  const maxY = Math.max(1, cumulative[n - 1])
  const x = (i: number) => PX + (i / denom) * (W - 2 * PX)
  const y = (v: number) => H - PY - (v / maxY) * (H - 2 * PY)

  let line = `M ${x(0)} ${y(0)}`
  cumulative.forEach((v, i) => {
    if (i === 0) return
    line += ` L ${x(i)} ${y(cumulative[i - 1])} L ${x(i)} ${y(v)}`
  })
  const area = `${line} L ${x(n - 1)} ${H - PY} L ${x(0)} ${H - PY} Z`
  const ticks = [0, maxY / 3, (maxY * 2) / 3, maxY]

  return (
    <div className="rc-pace">
      <div className="rc-pace-top">
        <span className="rc-big">{maxY}</span>
        <span className="rc-cap">{t('results.reveals')}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <defs>
          <linearGradient id="rcPaceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fdca0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8fdca0" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((v, i) => (
          <line
            key={i}
            className="rc-gridline"
            x1={PX}
            y1={y(v)}
            x2={W - PX}
            y2={y(v)}
          />
        ))}
        <path className="rc-area" d={area} />
        <path className="rc-line" d={line} pathLength={1} />
        {cumulative.map((v, i) =>
          i % 3 === 0 || i === n - 1 ? (
            <circle
              key={i}
              className="rc-pt"
              cx={x(i)}
              cy={y(v)}
              r={i === n - 1 ? 5 : 3}
              style={{ animationDelay: `${i * 40}ms` } as CSSProperties}
            />
          ) : null,
        )}
      </svg>
      <div className="rc-pace-axis">
        <span>0</span>
        <span>{Math.floor(n / 2)}</span>
        <span>{n}</span>
        <span>{t('results.chart.cards')}</span>
      </div>
    </div>
  )
}

/** Semicircular progress toward a daily goal. */
export function GoalGauge({ value, goal }: { value: number; goal: number }) {
  const { t } = useI18n()
  const pct = goal > 0 ? Math.min(1, value / goal) : 0
  const cx = 130
  const cy = 130
  const r = 100
  const A0 = -90
  const A1 = 90

  return (
    <div className="rc-gauge">
      <svg viewBox="0 0 260 168" aria-hidden="true">
        <path
          className="rc-gauge-track"
          d={arcPath(cx, cy, r, A0, A1)}
          strokeLinecap="round"
        />
        <path
          className="rc-gauge-value"
          d={arcPath(cx, cy, r, A0, A0 + 180 * pct)}
          strokeLinecap="round"
          pathLength={1}
        />
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const a = A0 + 180 * f
          const [x1, y1] = polar(cx, cy, r - 13, a)
          const [x2, y2] = polar(cx, cy, r - 4, a)
          return (
            <line
              key={f}
              className="rc-tick"
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            />
          )
        })}
      </svg>
      <div className="rc-gauge-center">
        <div className="rc-gauge-num">
          <span className="rc-big">{value}</span>
          <span className="rc-gauge-goal">/ {goal}</span>
        </div>
        <span className="rc-cap">{t('results.dailyGoal')}</span>
      </div>
    </div>
  )
}

/* ================================================================== *
 * Creative gallery
 * ================================================================== */

function Chart({
  label,
  caption,
  children,
}: {
  label: string
  caption: string
  children: React.ReactNode
}) {
  const { t } = useI18n()
  // bump to remount the stage and replay its CSS animations
  const [run, setRun] = useState(0)
  const [seen, setSeen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // charts already on screen keep their mount animation; charts further down
  // replay once the first time they scroll into view
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setSeen(true)
        setRun((r) => r + 1)
        io.disconnect()
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen])

  return (
    <section className="chart">
      <div className="chart-head">
        <div className="chart-titles">
          <h3 className="chart-label">{label}</h3>
          <p className="chart-caption">{caption}</p>
        </div>
        <button
          type="button"
          className="chart-play"
          onClick={() => setRun((r) => r + 1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
          {t('results.chart.play')}
        </button>
      </div>
      <div className="chart-stage" key={run} ref={ref}>
        {children}
      </div>
    </section>
  )
}

/** 02 — Meter: one stacked bar for the whole round. */
function ChartMeter({ t }: { t: T }) {
  const segs = [
    { cls: 'new', n: SAMPLE.newWords },
    { cls: 'review', n: SAMPLE.reviewWords },
    { cls: 'exposed', n: SAMPLE.exposed },
  ] as const

  return (
    <div className="rc rc-meter">
      <div className="rc-meter-top">
        <div>
          <span className="rc-big">{SAMPLE.studied}</span>
          <span className="rc-cap">{t('results.studied')}</span>
        </div>
        <span className="rc-meter-total">
          {SAMPLE.reveals} {t('results.reveals')}
        </span>
      </div>
      <div className="rc-meter-bar">
        {segs.map((s, i) => (
          <span
            key={s.cls}
            className={`rc-meter-seg ${s.cls}`}
            style={
              {
                '--w': `${(s.n / TOTAL) * 100}%`,
                animationDelay: `${i * 110}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <ul className="rc-meter-legend">
        {segs.map((s) => (
          <li key={s.cls} className={s.cls}>
            <span className="rc-dot" />
            <b>{s.n}</b>
            <span>{t(`results.${s.cls}`)}</span>
          </li>
        ))}
      </ul>
      <div className="rc-meter-note">
        {(SAMPLE.reveals / SAMPLE.studied).toFixed(1)}{' '}
        {t('results.chart.avg')}
      </div>
    </div>
  )
}

/** 03 — Heat grid: every word as a tile shaded by reveal count. */
function ChartGrid({ t }: { t: T }) {
  const sorted = [...WORDS].sort((a, b) => b.n - a.n)
  return (
    <div className="rc rc-grid-wrap">
      <div className="rc-grid">
        {sorted.map((w, i) => (
          <div
            key={w.w}
            className={`rc-cell ${w.kind}`}
            style={
              {
                '--i': w.n / MAX_N,
                animationDelay: `${i * 45}ms`,
              } as CSSProperties
            }
          >
            <span className="rc-cell-word">{w.w}</span>
            <span className="rc-cell-n">×{w.n}</span>
          </div>
        ))}
      </div>
      <div className="rc-scale">
        <span className="rc-scale-cap">{t('results.reveals')}</span>
        <span className="rc-scale-cells">
          {[1, 2, 3, 4, 5].map((n) => (
            <i key={n} style={{ '--i': n / MAX_N } as CSSProperties} />
          ))}
        </span>
        <span className="rc-scale-cap">1 → 5</span>
      </div>
    </div>
  )
}

/** 04 — Radial: a spoke per word, length = reveal count. */
function ChartRadial({ t }: { t: T }) {
  const R0 = 42
  const SCALE = 66
  const step = 360 / WORDS.length
  return (
    <div className="rc rc-radial">
      <div className="rc-radial-svg">
        <svg viewBox="0 0 240 240" aria-hidden="true">
          <circle className="rc-radial-hub" cx="120" cy="120" r={R0 - 8} />
          {WORDS.map((w, i) => {
            const a = i * step
            const len = (w.n / MAX_N) * SCALE
            const [x1, y1] = polar(120, 120, R0, a)
            const [tx2, ty2] = polar(120, 120, R0 + SCALE, a)
            const [x2, y2] = polar(120, 120, R0 + len, a)
            return (
              <g key={w.w}>
                <line
                  className="rc-spoke-track"
                  x1={x1}
                  y1={y1}
                  x2={tx2}
                  y2={ty2}
                  strokeLinecap="round"
                />
                <line
                  className={`rc-spoke ${w.kind}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  strokeLinecap="round"
                  style={
                    {
                      '--len': Math.max(2, len),
                      animationDelay: `${i * 45}ms`,
                    } as CSSProperties
                  }
                />
              </g>
            )
          })}
        </svg>
        <div className="rc-center">
          <span className="rc-big">{SAMPLE.reveals}</span>
          <span className="rc-cap">{t('results.reveals')}</span>
        </div>
      </div>
      <p className="rc-radial-note">
        {WORDS.length} {t('results.encountered')} · {t('results.new')}{' '}
        {SAMPLE.newWords} · {t('results.review')} {SAMPLE.reviewWords}
      </p>
    </div>
  )
}

/** 07 — Waffle: a square per card toward the daily goal. */
function ChartWaffle({ t }: { t: T }) {
  const goal = 24
  const cells = Array.from({ length: goal }, (_, i) =>
    i >= SAMPLE.studied ? 'empty' : i < SAMPLE.newWords ? 'new' : 'review',
  )
  return (
    <div className="rc rc-waffle">
      <div className="rc-waffle-head">
        <span className="rc-big">{SAMPLE.studied}</span>
        <span className="rc-cap">
          / {goal} {t('results.dailyGoal')}
        </span>
      </div>
      <div className="rc-waffle-grid">
        {cells.map((c, i) => (
          <span
            key={i}
            className={`rc-waffle-cell ${c}`}
            style={{ animationDelay: `${i * 16}ms` } as CSSProperties}
          />
        ))}
      </div>
      <ul className="rc-meter-legend">
        <li className="new">
          <span className="rc-dot" />
          <b>{SAMPLE.newWords}</b>
          <span>{t('results.new')}</span>
        </li>
        <li className="review">
          <span className="rc-dot" />
          <b>{SAMPLE.reviewWords}</b>
          <span>{t('results.review')}</span>
        </li>
      </ul>
    </div>
  )
}

/** 08 — Funnel: how many cards survive each step of the round. */
function ChartFunnel({ t }: { t: T }) {
  const encountered = SAMPLE.studied + SAMPLE.exposed
  const stages = [
    { key: 'seen', n: encountered },
    { key: 'revealed', n: SAMPLE.studied },
    { key: 'repeat', n: WORDS.filter((w) => w.n >= 2).length },
    { key: 'mastered', n: WORDS.filter((w) => w.n >= 3).length },
  ]
  const max = encountered
  return (
    <div className="rc rc-funnel">
      <div className="rc-funnel-bars">
        {stages.map((s, i) => {
          const pct = Math.round((s.n / max) * 100)
          const conv =
            i === 0 ? 100 : Math.round((s.n / stages[i - 1].n) * 100)
          return (
            <div className={`rc-funnel-row s${i + 1}`} key={s.key}>
              <span className="rc-funnel-label">
                {t(`results.chart.stage.${s.key}`)}
              </span>
              <span className="rc-funnel-track">
                <span
                  className="rc-funnel-bar"
                  style={
                    {
                      '--w': `${pct}%`,
                      animationDelay: `${i * 130}ms`,
                    } as CSSProperties
                  }
                >
                  <b>{s.n}</b>
                </span>
              </span>
              <span className="rc-funnel-conv">{i === 0 ? '' : `${conv}%`}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** 09 — Mosaic: word area = reveals, split by new / review. */
function ChartMosaic({ t }: { t: T }) {
  const groups = [
    { key: 'new', words: WORDS.filter((w) => w.kind === 'new') },
    { key: 'review', words: WORDS.filter((w) => w.kind === 'review') },
  ] as const
  const totals = groups.map((g) => g.words.reduce((a, w) => a + w.n, 0))
  return (
    <div className="rc rc-mosaic">
      {groups.map((g, gi) => (
        <div
          key={g.key}
          className={`rc-mosaic-col ${g.key}`}
          style={{ flexGrow: totals[gi] }}
        >
          {g.words.map((w) => (
            <div
              key={w.w}
              className="rc-mosaic-block"
              style={
                {
                  flexGrow: w.n,
                  '--i': w.n / MAX_N,
                } as CSSProperties
              }
              title={`${w.w} ×${w.n}`}
            >
              {w.n >= 2 && (
                <span className="rc-mosaic-word">
                  {w.w}
                  <em>×{w.n}</em>
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
      <ul className="rc-mosaic-legend">
        <li>
          <span className="rc-dot new" />
          {t('results.new')}
        </li>
        <li>
          <span className="rc-dot review" />
          {t('results.review')}
        </li>
      </ul>
    </div>
  )
}

/** 10 — Word cloud: size scales with reveal count. */
function ChartCloud({ t }: { t: T }) {
  return (
    <div className="rc rc-cloud">
      <div className="rc-cloud-words">
        {WORDS.map((w, i) => (
          <span
            key={w.w}
            className={`rc-cloud-word ${w.kind}`}
            style={
              {
                fontSize: `${0.9 + (w.n / MAX_N) * 1.6}rem`,
                opacity: 0.5 + (w.n / MAX_N) * 0.5,
                animationDelay: `${i * 55}ms`,
              } as CSSProperties
            }
          >
            {w.w}
          </span>
        ))}
      </div>
      <p className="rc-cloud-note">
        {SAMPLE.reveals} {t('results.reveals')} · {WORDS.length}{' '}
        {t('results.encountered')}
      </p>
    </div>
  )
}

/** 11 — Combo: per-word reveals as bars, running total as a line. */
function ChartCombo({ t }: { t: T }) {
  const W = 680
  const H = 236
  const PX = 30
  const PY = 24
  const n = WORDS.length
  const cum: number[] = []
  WORDS.reduce((a, w) => {
    const v = a + w.n
    cum.push(v)
    return v
  }, 0)
  const maxCum = cum[n - 1]
  const slot = (W - 2 * PX) / n
  const bw = slot * 0.46
  const x = (i: number) => PX + slot * i + slot / 2
  const yBar = (v: number) => H - PY - (v / MAX_N) * (H - 2 * PY)
  const yCum = (v: number) => H - PY - (v / maxCum) * (H - 2 * PY)
  const line = cum.map((v, i) => `${i ? 'L' : 'M'} ${x(i)} ${yCum(v)}`).join(' ')

  return (
    <div className="rc rc-combo">
      <div className="rc-combo-top">
        <span className="rc-big">{SAMPLE.reveals}</span>
        <span className="rc-cap">{t('results.reveals')}</span>
        <ul className="rc-combo-legend">
          <li className="bars">
            <i />
            {t('results.chart.comboBars')}
          </li>
          <li className="line">
            <i />
            {t('results.chart.comboLine')}
          </li>
        </ul>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            className="rc-gridline"
            x1={PX}
            y1={yBar(MAX_N * f)}
            x2={W - PX}
            y2={yBar(MAX_N * f)}
          />
        ))}
        {WORDS.map((w, i) => (
          <rect
            key={w.w}
            className={`rc-combo-bar ${w.kind}`}
            x={x(i) - bw / 2}
            y={yBar(w.n)}
            width={bw}
            height={(w.n / MAX_N) * (H - 2 * PY)}
            rx={4}
            style={{ animationDelay: `${i * 45}ms` } as CSSProperties}
          />
        ))}
        <path className="rc-combo-line" d={line} pathLength={1} />
        {cum.map((v, i) => (
          <circle
            key={i}
            className="rc-combo-pt"
            cx={x(i)}
            cy={yCum(v)}
            r={2.6}
          />
        ))}
      </svg>
      <div className="rc-combo-axis">
        <span>{WORDS[0].w}</span>
        <span>{WORDS[Math.floor(n / 2)].w}</span>
        <span>{WORDS[n - 1].w}</span>
      </div>
    </div>
  )
}

/** 12 — Radar: five normalized measures of the round. */
function ChartRadar({ t }: { t: T }) {
  const avg = SAMPLE.reveals / SAMPLE.studied
  const repeat = WORDS.filter((w) => w.n >= 2).length
  const axes = [
    { key: 'coverage', v: SAMPLE.studied / 15 },
    { key: 'depth', v: avg / 3 },
    { key: 'recall', v: repeat / SAMPLE.studied },
    { key: 'fresh', v: SAMPLE.newWords / SAMPLE.studied },
    {
      key: 'exposure',
      v: SAMPLE.exposed / (SAMPLE.studied + SAMPLE.exposed),
    },
  ].map((a) => ({ ...a, v: Math.max(0.08, Math.min(1, a.v)) }))

  const cx = 120
  const cy = 122
  const R = 84
  const count = axes.length
  const at = (v: number, i: number) => polar(cx, cy, R * v, (i * 360) / count)

  return (
    <div className="rc rc-radar">
      <div className="rc-radar-svg">
        <svg viewBox="0 0 240 240" aria-hidden="true">
          {[0.25, 0.5, 0.75, 1].map((r) => (
            <polygon
              key={r}
              className="rc-radar-ring"
              points={axes.map((_, i) => at(r, i).join(',')).join(' ')}
            />
          ))}
          {axes.map((_, i) => {
            const [x, y] = at(1, i)
            return (
              <line
                key={i}
                className="rc-radar-spoke"
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
              />
            )
          })}
          <polygon
            className="rc-radar-area"
            points={axes.map((a, i) => at(a.v, i).join(',')).join(' ')}
          />
          {axes.map((a, i) => {
            const [x, y] = at(a.v, i)
            return (
              <circle key={a.key} className="rc-radar-pt" cx={x} cy={y} r={3} />
            )
          })}
        </svg>
      </div>
      <ul className="rc-radar-legend">
        {axes.map((a) => (
          <li key={a.key}>
            <span>{t(`results.chart.axis.${a.key}`)}</span>
            <b>{Math.round(a.v * 100)}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Reusable dual combo: one bar pair per round, plus two running totals.
 *  Exposure is capped at `deck` (cards per round); reveals are uncapped. */
export function Dual({
  rounds,
  deck,
}: {
  rounds: { e: number; r: number }[]
  deck: number
}) {
  const { t } = useI18n()
  const W = 720
  const H = 250
  const PX = 30
  const PY = 26
  /** Cards per round — the ceiling for a single round's exposure. */
  const DECK = deck || 1
  const n = rounds.length
  const maxRev = Math.max(1, ...rounds.map((d) => d.r))

  const cumExp = rounds.reduce<number[]>((acc, d) => {
    acc.push((acc[acc.length - 1] ?? 0) + d.e)
    return acc
  }, [])
  const cumRev = rounds.reduce<number[]>((acc, d) => {
    acc.push((acc[acc.length - 1] ?? 0) + d.r)
    return acc
  }, [])
  const totalExp = cumExp[n - 1] || 1
  const totalRev = cumRev[n - 1] || 1

  const slot = (W - 2 * PX) / Math.max(1, n)
  const bw = slot * 0.26
  const cx = (i: number) => PX + slot * i + slot / 2
  const yExp = (v: number) => H - PY - (v / DECK) * (H - 2 * PY)
  const yRev = (v: number) => H - PY - (v / maxRev) * (H - 2 * PY)
  const yCum = (v: number, total: number) =>
    H - PY - (v / total) * (H - 2 * PY)
  const lineExp = cumExp
    .map((v, i) => `${i ? 'L' : 'M'} ${cx(i)} ${yCum(v, totalExp)}`)
    .join(' ')
  const lineRev = cumRev
    .map((v, i) => `${i ? 'L' : 'M'} ${cx(i)} ${yCum(v, totalRev)}`)
    .join(' ')

  const legend = [
    { cls: 'exp-bar', label: t('results.exposed'), v: 'bar' },
    { cls: 'rev-bar', label: t('results.reveals'), v: 'bar' },
    { cls: 'exp-line', label: t('results.chart.cumExposure'), v: 'line' },
    { cls: 'rev-line', label: t('results.chart.cumReveal'), v: 'line' },
  ]

  return (
    <div className="rc rc-dual">
      <div className="rc-dual-top">
        <span className="rc-big">{totalRev}</span>
        <span className="rc-cap">{t('results.reveals')}</span>
        <ul className="rc-dual-legend">
          {legend.map((l) => (
            <li key={l.cls} className={l.cls}>
              <i />
              {l.label}
            </li>
          ))}
        </ul>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            className="rc-gridline"
            x1={PX}
            y1={H - PY - f * (H - 2 * PY)}
            x2={W - PX}
            y2={H - PY - f * (H - 2 * PY)}
          />
        ))}
        {rounds.map((d, i) => (
          <g key={i}>
            <rect
              className="rc-dual-bar exposure"
              x={cx(i) - bw - 2}
              y={yExp(d.e)}
              width={bw}
              height={(d.e / DECK) * (H - 2 * PY)}
              rx={3}
              style={{ animationDelay: `${i * 40}ms` } as CSSProperties}
            />
            <rect
              className="rc-dual-bar reveal"
              x={cx(i) + 2}
              y={yRev(d.r)}
              width={bw}
              height={(d.r / maxRev) * (H - 2 * PY)}
              rx={3}
              style={{ animationDelay: `${i * 40 + 60}ms` } as CSSProperties}
            />
          </g>
        ))}
        <path className="rc-dual-line exposure" d={lineExp} />
        <path className="rc-dual-line reveal" d={lineRev} pathLength={1} />
        {cumExp.map((v, i) => (
          <circle
            key={`e${i}`}
            className="rc-dual-pt exposure"
            cx={cx(i)}
            cy={yCum(v, totalExp)}
            r={2.4}
          />
        ))}
        {cumRev.map((v, i) => (
          <circle
            key={`r${i}`}
            className="rc-dual-pt reveal"
            cx={cx(i)}
            cy={yCum(v, totalRev)}
            r={2.4}
          />
        ))}
      </svg>
      <div className="rc-dual-axis">
        {(n <= 6
          ? rounds.map((_, i) => i)
          : [0, Math.floor((n - 1) / 2), n - 1]
        ).map((i) => (
          <span key={i}>R{i + 1}</span>
        ))}
        <span>{t('results.chart.rounds')}</span>
      </div>
      <div className="rc-dual-scale">
        <span>
          {t('results.exposed')} · max {DECK}
        </span>
        <span>
          {t('results.reveals')} · max {maxRev}
        </span>
      </div>
    </div>
  )
}

/** 14 — Halo · gloss: gradient ring with a dotted exposure halo. */
function ChartHaloGloss({ t }: { t: T }) {
  const { studied, newWords, reviewWords, exposed } = SAMPLE
  const R = 86
  const R2 = 118
  const C = 2 * Math.PI * R
  // green starts at 0 o'clock; a gap only at the new/review join
  const gapDeg = (16 / C) * 360
  const newFrac = newWords / studied
  const newEnd = 360 * newFrac
  const expFrac = exposed / (studied + exposed)
  const newPct = Math.round(newFrac * 100)

  // explicit arcs so each can draw cleanly from its own start
  const newPath = arcPath(130, 130, R, 0, newEnd - gapDeg)
  const revPath = arcPath(130, 130, R, newEnd + gapDeg, 360)
  const expPath = arcPath(130, 130, R2, 0, 360 * expFrac)

  return (
    <div className="rc rc-halo-gloss">
      <div className="rhg-donut">
        <svg viewBox="0 0 260 260" aria-hidden="true">
          <defs>
            <linearGradient id="rhgNew" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c6f1cf" />
              <stop offset="100%" stopColor="#57b477" />
            </linearGradient>
            <linearGradient id="rhgReview" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f7e3a8" />
              <stop offset="100%" stopColor="#c9a84f" />
            </linearGradient>
          </defs>
          <circle className="rhg-dots" cx="130" cy="130" r={R2} />
          {expFrac > 0 && (
            <path className="rhg-expo" d={expPath} pathLength={1} />
          )}
          <circle className="rhg-track" cx="130" cy="130" r={R} />
          {newWords > 0 && (
            <path className="rhg-seg new" d={newPath} pathLength={1} />
          )}
          {reviewWords > 0 && (
            <path className="rhg-seg review" d={revPath} pathLength={1} />
          )}
        </svg>
        <div className="rhg-center">
          <span className="rc-big">{studied}</span>
          <span className="rc-cap">{t('results.studied')}</span>
        </div>
      </div>
      <ul className="rhg-legend">
        <li className="new">
          <i />
          <span>{t('results.new')}</span>
          <b>{newWords}</b>
          <em>{newPct}%</em>
        </li>
        <li className="review">
          <i />
          <span>{t('results.review')}</span>
          <b>{reviewWords}</b>
          <em>{100 - newPct}%</em>
        </li>
        <li className="exposed">
          <i />
          <span>{t('results.exposed')}</span>
          <b>{exposed}</b>
        </li>
      </ul>
    </div>
  )
}

/** 15 — Halo · ticks: one tick per card toward the goal. */
function ChartHaloTicks({ t }: { t: T }) {
  const total = 36
  const filled = Math.min(total, SAMPLE.studied)
  const ticks = Array.from({ length: total }, (_, i) =>
    i >= filled ? 'empty' : i < SAMPLE.newWords ? 'new' : 'review',
  )
  return (
    <div className="rc rc-halo-ticks">
      <div className="rht-dial">
        <svg viewBox="0 0 260 260" aria-hidden="true">
          {ticks.map((k, i) => {
            const a = (i * 360) / total
            const [x1, y1] = polar(130, 130, 86, a)
            const [x2, y2] = polar(130, 130, 110, a)
            return (
              <line
                key={i}
                className={`rht-tick ${k}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeLinecap="round"
                style={{ animationDelay: `${i * 14}ms` } as CSSProperties}
              />
            )
          })}
        </svg>
        <div className="rht-center">
          <span className="rc-big">{SAMPLE.studied}</span>
          <span className="rc-cap">{t('results.studied')}</span>
        </div>
      </div>
      <ul className="rht-legend">
        <li className="new">
          <i />
          {SAMPLE.newWords} {t('results.new')}
        </li>
        <li className="review">
          <i />
          {SAMPLE.reviewWords} {t('results.review')}
        </li>
      </ul>
    </div>
  )
}

/** Pie · explode: slices pull apart; hover pushes one further out. */
export function PieExplode({
  newWords,
  reviewWords,
  exposed,
}: {
  newWords: number
  reviewWords: number
  exposed: number
}) {
  const { t } = useI18n()
  const slices = slicesOf(newWords, reviewWords, exposed)
  return (
    <div className="rc-pie rc-pie-explode">
      <div className="rpe-dial">
        <svg viewBox="0 0 260 260" aria-hidden="true">
          {slices.map((s, i) => {
            const [dx, dy] = polar(0, 0, 9, s.mid)
            const [lx, ly] = polar(130, 130, 104 * 0.66, s.mid)
            return (
              <g
                key={s.key}
                className={`rpe-slot ${s.key}`}
                style={
                  {
                    '--ox': `${dx}px`,
                    '--oy': `${dy}px`,
                    '--d': `${i * 130}ms`,
                  } as CSSProperties
                }
              >
                <path
                  className={`rp-slice ${s.key}`}
                  d={wedgePath(130, 130, 104, s.a0 + 2.5, s.a1 - 2.5)}
                />
                <text
                  className="rp-slice-label"
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {Math.round(s.frac * 100)}%
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <ul className="rc-legend">
        {slices.map((s) => (
          <li key={s.key} className={s.key}>
            <span className="rc-dot" />
            <span>{t(`results.${s.key}`)}</span>
            <b>{s.n}</b>
            <em>{Math.round(s.frac * 100)}%</em>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Creative: fifteen ways to chart a finished round. */
export default function ResultCharts() {
  const { t } = useI18n()
  return (
    <div className="charts">
      <Chart
        label={`01 · ${t('results.chart.pie')}`}
        caption={t('results.chart.cap.pieExplode')}
      >
        <div className="rc">
          <PieExplode
            newWords={SAMPLE.newWords}
            reviewWords={SAMPLE.reviewWords}
            exposed={SAMPLE.exposed}
          />
        </div>
      </Chart>
      <Chart
        label={`02 · ${t('results.chart.meter')}`}
        caption={t('results.chart.cap.meter')}
      >
        <ChartMeter t={t} />
      </Chart>
      <Chart
        label={`03 · ${t('results.chart.grid')}`}
        caption={t('results.chart.cap.grid')}
      >
        <ChartGrid t={t} />
      </Chart>
      <Chart
        label={`04 · ${t('results.chart.radial')}`}
        caption={t('results.chart.cap.radial')}
      >
        <ChartRadial t={t} />
      </Chart>
      <Chart
        label={`05 · ${t('results.chart.pace')}`}
        caption={t('results.chart.cap.pace')}
      >
        <div className="rc">
          <Pace steps={WORDS.map((w) => w.n)} />
        </div>
      </Chart>
      <Chart
        label={`06 · ${t('results.chart.gauge')}`}
        caption={t('results.chart.cap.gauge')}
      >
        <div className="rc">
          <GoalGauge value={SAMPLE.studied} goal={15} />
        </div>
      </Chart>
      <Chart
        label={`07 · ${t('results.chart.waffle')}`}
        caption={t('results.chart.cap.waffle')}
      >
        <ChartWaffle t={t} />
      </Chart>
      <Chart
        label={`08 · ${t('results.chart.funnel')}`}
        caption={t('results.chart.cap.funnel')}
      >
        <ChartFunnel t={t} />
      </Chart>
      <Chart
        label={`09 · ${t('results.chart.mosaic')}`}
        caption={t('results.chart.cap.mosaic')}
      >
        <ChartMosaic t={t} />
      </Chart>
      <Chart
        label={`10 · ${t('results.chart.cloud')}`}
        caption={t('results.chart.cap.cloud')}
      >
        <ChartCloud t={t} />
      </Chart>
      <Chart
        label={`11 · ${t('results.chart.combo')}`}
        caption={t('results.chart.cap.combo')}
      >
        <ChartCombo t={t} />
      </Chart>
      <Chart
        label={`12 · ${t('results.chart.radar')}`}
        caption={t('results.chart.cap.radar')}
      >
        <ChartRadar t={t} />
      </Chart>
      <Chart
        label={`13 · ${t('results.chart.dual')}`}
        caption={t('results.chart.cap.dual')}
      >
        <Dual rounds={SAMPLE_ROUNDS} deck={12} />
      </Chart>
      <Chart
        label={`14 · ${t('results.chart.haloGloss')}`}
        caption={t('results.chart.cap.haloGloss')}
      >
        <ChartHaloGloss t={t} />
      </Chart>
      <Chart
        label={`15 · ${t('results.chart.haloTicks')}`}
        caption={t('results.chart.cap.haloTicks')}
      >
        <ChartHaloTicks t={t} />
      </Chart>
    </div>
  )
}
