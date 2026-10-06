// Demo word lists for the Wordbooks page. Appearance only — the counts are
// invented, but the shape (total / learned, and which lists a book can trim)
// is what the page needs.
//
// Names are deliberate: the school / exam lists are written the way a Chinese
// learner reads them (义务教育·小学, CET4(四级), …) and are not translated.
// Only the Oxford lists carry an English form.

export type LangId = 'en' | 'zh' | 'ja' | 'ko'
export type Locale = 'en' | 'zh'

export type BookName = { en: string; zh: string }

/** A list that can be excluded from a book, and how many words it trims. */
export type Candidate = { id: string; covers: number }

export type Book = {
  id: string
  lang: LangId
  name: BookName
  total: number
  learned: number
  /** Lists the learner can drop, with the words each one saves. */
  excludes?: Candidate[]
}

export const LANGS: { id: LangId; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'zh', label: '中文' },
  { id: 'ja', label: '日本語' },
  { id: 'ko', label: '한국어' },
]

/** Both languages read the same for the literal names. */
const only = (name: string): BookName => ({ en: name, zh: name })

const english: Book[] = [
  {
    id: 'en-primary',
    lang: 'en',
    name: only('义务教育·小学'),
    total: 800,
    learned: 800,
  },
  {
    id: 'en-junior',
    lang: 'en',
    name: only('义务教育·初中'),
    total: 1600,
    learned: 1530,
  },
  {
    id: 'en-senior',
    lang: 'en',
    name: only('普通高中'),
    total: 3500,
    learned: 980,
  },
  {
    id: 'en-cet4',
    lang: 'en',
    name: only('CET4(四级)'),
    total: 4500,
    learned: 1240,
    excludes: [
      { id: 'en-primary', covers: 620 },
      { id: 'en-junior', covers: 1100 },
      { id: 'en-senior', covers: 1650 },
    ],
  },
  {
    id: 'en-cet6',
    lang: 'en',
    name: only('CET6(六级)'),
    total: 5500,
    learned: 320,
    excludes: [
      { id: 'en-primary', covers: 620 },
      { id: 'en-junior', covers: 1100 },
      { id: 'en-senior', covers: 1650 },
      { id: 'en-cet4', covers: 1400 },
    ],
  },
  {
    id: 'en-ox3',
    lang: 'en',
    name: { en: 'Oxford 3000', zh: '牛津3000词' },
    total: 3000,
    learned: 2100,
    excludes: [
      { id: 'en-primary', covers: 760 },
      { id: 'en-junior', covers: 1300 },
    ],
  },
  {
    id: 'en-ox5',
    lang: 'en',
    name: { en: 'Oxford 5000', zh: '牛津5000词' },
    total: 5000,
    learned: 640,
    excludes: [{ id: 'en-ox3', covers: 2500 }],
  },
]

/** HSK 1–9; each level can drop every level below it. */
const HSK_TOTAL = [150, 300, 600, 1200, 2500, 5000, 7000, 9000, 11000]
const HSK_LEARNED = [150, 300, 420, 260, 0, 0, 0, 0, 0]
const chinese: Book[] = HSK_TOTAL.map((total, i) => ({
  id: `hsk-${i + 1}`,
  lang: 'zh',
  name: only(`HSK ${i + 1}`),
  total,
  learned: HSK_LEARNED[i],
  excludes: Array.from({ length: i }, (_, j) => ({
    id: `hsk-${j + 1}`,
    covers: Math.round(HSK_TOTAL[j] * 0.25),
  })),
}))

/** JLPT N5 → N1; each level can drop the easier levels. */
const JLPT_TOTAL = [800, 1500, 3750, 6000, 10000]
const JLPT_LEARNED = [800, 700, 120, 0, 0]
const japanese: Book[] = JLPT_TOTAL.map((total, i) => ({
  id: `jlpt-${i + 1}`,
  lang: 'ja',
  name: only(`JLPT N${5 - i}`),
  total,
  learned: JLPT_LEARNED[i],
  excludes: Array.from({ length: i }, (_, j) => ({
    id: `jlpt-${j + 1}`,
    covers: Math.round(JLPT_TOTAL[j] * 0.3),
  })),
}))

const korean: Book[] = [
  {
    id: 'ko-1',
    lang: 'ko',
    name: only('韩语常用5000词·初级'),
    total: 1800,
    learned: 900,
  },
  {
    id: 'ko-2',
    lang: 'ko',
    name: only('韩语常用5000词·中级'),
    total: 3200,
    learned: 100,
    excludes: [{ id: 'ko-1', covers: 900 }],
  },
  {
    id: 'ko-3',
    lang: 'ko',
    name: only('韩语常用5000词·高级'),
    total: 5000,
    learned: 0,
    excludes: [
      { id: 'ko-1', covers: 900 },
      { id: 'ko-2', covers: 1400 },
    ],
  },
]

export const BOOKS: Book[] = [...english, ...chinese, ...japanese, ...korean]
