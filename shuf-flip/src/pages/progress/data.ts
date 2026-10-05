import type { BurstCat } from '../home/progressBurstData'

export type DimKey = 'day' | 'month'

const LANGS = [
  { key: 'en', label: 'progress.lang.en' },
  { key: 'zh', label: 'progress.lang.zh' },
  { key: 'ja', label: 'progress.lang.ja' },
]
const STATUSES = [
  { key: 'exposed', label: 'progress.status.exposed' },
  { key: 'before', label: 'progress.status.revealedBefore' },
  { key: 'today', label: 'progress.status.revealedToday' },
]

/** Build a language × reveal-status burst from a 3×3 count grid. */
function burst(counts: number[][]): BurstCat[] {
  return LANGS.map((lang, i) => ({
    key: lang.key,
    label: lang.label,
    children: STATUSES.map((st, j) => ({
      key: st.key,
      label: st.label,
      n: counts[i][j],
    })),
  }))
}

/**
 * Sum a series into a fixed number of near-equal buckets. This is what lets
 * one daily history feed every zoom level — a 30-day month becomes 30 daily
 * bars, while 1000 days collapse into 12 monthly bars.
 */
export function bucketize(values: number[], cols: number): number[] {
  const n = values.length
  if (cols <= 0 || n === 0) return values.slice()
  return Array.from({ length: cols }, (_, b) => {
    const start = Math.floor((b * n) / cols)
    const end = Math.floor(((b + 1) * n) / cols)
    let sum = 0
    for (let i = start; i < end; i++) sum += values[i] ?? 0
    return sum
  })
}

/** Two daily series → Dual rounds ({e, r}), bucketed to `cols` columns. */
function roundsOf(review: number[], newWords: number[], cols: number) {
  const e = bucketize(review, cols)
  const r = bucketize(newWords, cols)
  return e.map((n, i) => ({ e: n, r: r[i] }))
}

const tail = <T>(list: T[], n: number) => list.slice(-n)

/** A synthetic daily history — long enough to stand in for years of study. */
const DAYS = 1000
const REVIEW_DAILY = Array.from({ length: DAYS }, (_, i) =>
  Math.max(0, Math.round(4 + Math.sin(i / 5) * 2 + Math.sin(i / 23) * 3)),
)
const NEW_DAILY = Array.from({ length: DAYS }, (_, i) =>
  Math.max(0, Math.round(7 + Math.cos(i / 6) * 3 + Math.sin(i / 17) * 4)),
)

export type Dim = {
  label: string
  /** Day zoom only. */
  gauge?: { value: number; goal: number }
  pie?: { newWords: number; reviewWords: number; exposed: number }
  burst: BurstCat[]
  /** Bars for the Dual: exposure/reveals (day) or review/new (week+). */
  rounds: { e: number; r: number }[]
}

/** The same session read at four zoom levels. */
export const DIMS: Record<DimKey, Dim> = {
  day: {
    label: 'progress.dim.day',
    gauge: { value: 5, goal: 15 },
    pie: { newWords: 3, reviewWords: 2, exposed: 5 },
    burst: burst([
      [2, 1, 2],
      [1, 0, 1],
      [1, 1, 0],
    ]),
    // hourly exposure / reveals over the day
    rounds: [
      { e: 0, r: 0 },
      { e: 0, r: 0 },
      { e: 0, r: 0 },
      { e: 2, r: 3 },
      { e: 3, r: 4 },
      { e: 4, r: 6 },
      { e: 6, r: 8 },
      { e: 4, r: 5 },
      { e: 5, r: 7 },
      { e: 2, r: 3 },
      { e: 4, r: 5 },
      { e: 1, r: 1 },
    ],
  },
  month: {
    label: 'progress.dim.month',
    burst: burst([
      [30, 42, 12],
      [15, 24, 7],
      [20, 30, 9],
    ]),
    // a month = one bar per day
    rounds: roundsOf(tail(REVIEW_DAILY, 30), tail(NEW_DAILY, 30), 30),
  },
}
