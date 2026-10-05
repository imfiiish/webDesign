/** Demo data for the "words learned" galleries (ResultWords and the
 *  micro-tweak board). A word per reveal, new / review mixed, highest first. */

export type Kind = 'new' | 'review'
export type Learned = { w: string; kind: Kind; n: number }

export const LEARNED: Learned[] = [
  { w: 'meticulous', kind: 'review', n: 4 },
  { w: 'benevolent', kind: 'review', n: 3 },
  { w: 'resilient', kind: 'new', n: 3 },
  { w: 'eloquent', kind: 'new', n: 2 },
  { w: 'candid', kind: 'new', n: 2 },
  { w: 'diligent', kind: 'review', n: 2 },
  { w: 'frugal', kind: 'new', n: 1 },
  { w: 'genuine', kind: 'new', n: 1 },
  { w: 'humble', kind: 'review', n: 1 },
  { w: 'lucid', kind: 'new', n: 1 },
  { w: 'vivid', kind: 'review', n: 1 },
  { w: 'abandon', kind: 'new', n: 1 },
]

export const MAX = Math.max(...LEARNED.map((d) => d.n))
export const NEW = LEARNED.filter((d) => d.kind === 'new')
export const REVIEW = LEARNED.filter((d) => d.kind === 'review')
export const TOTAL = LEARNED.reduce((sum, d) => sum + d.n, 0)
