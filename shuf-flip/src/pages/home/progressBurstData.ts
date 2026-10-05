/* Shared burst data for the sunburst chart (Progress page + Creative). */

export type BurstChild = { key: string; label: string; n: number }
export type BurstCat = { key: string; label: string; children: BurstChild[] }

/** Inner ring: language. Outer ring: how the word was revealed. */
export const BURST: BurstCat[] = [
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

/** Three solid tones per language, dim → bright: exposed → before → today. */
export const SHADES: Record<string, [string, string, string]> = {
  en: ['#4fb26e', '#8fdca0', '#bdf3c9'],
  zh: ['#c39f3d', '#e6c877', '#f7e6ad'],
  ja: ['#4e86ab', '#7fb3d5', '#bcd8ec'],
}
