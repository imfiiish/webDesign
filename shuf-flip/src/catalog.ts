// Single source of truth for the design catalog.
// Appearance only — no business logic. `title` is a proper noun (kept as-is);
// the description is bilingual.

type EntryKind = 'page' | 'component' | 'scene'
type EntryStatus = 'ready' | 'planned'

export type Bilingual = { en: string; zh: string }

/** One design of an entry. Every entry starts with a single "Default"; a page
 *  can gain more designs (variants) over time. */
export type CatalogVariant = {
  id: string
  name: Bilingual
}

export type CatalogEntry = {
  id: string
  kind: EntryKind
  title: string
  description: Bilingual
  status: EntryStatus
  variants: CatalogVariant[]
}

/** The base variant every entry starts with. */
export const DEFAULT_VARIANT: CatalogVariant = {
  id: 'default',
  name: { en: 'Default', zh: '默认' },
}

export const PAGES: CatalogEntry[] = [
  {
    id: 'login',
    kind: 'page',
    title: 'Login',
    description: {
      en: 'Step-wise entry: username expands, password dots, guest link.',
      zh: '分步进入：账号展开、密码圆点、游客入口。',
    },
    status: 'ready',
    variants: [DEFAULT_VARIANT],
  },
  {
    id: 'shelf',
    kind: 'page',
    title: 'Shelf',
    description: {
      en: 'Book-spine shelf with progress, hover and delete confirm.',
      zh: '书脊书架，带进度、悬浮与删除确认。',
    },
    status: 'ready',
    variants: [DEFAULT_VARIANT],
  },
  {
    id: 'flip',
    kind: 'page',
    title: 'Flip',
    description: {
      en: 'Card ring: reveal definition, wheel / key flip, next round.',
      zh: '环形卡片：展开释义、滚轮/按键翻页、下一轮。',
    },
    status: 'ready',
    variants: [DEFAULT_VARIANT],
  },
  {
    id: 'rating',
    kind: 'page',
    title: 'Rating',
    description: {
      en: 'Self-test: 1 / 2 / 3 rating bar with undo and skip confirm.',
      zh: '自测：1 / 2 / 3 评级条，含撤销与跳过确认。',
    },
    status: 'ready',
    variants: [DEFAULT_VARIANT],
  },
]

// Scenes: a page assembled with extra state (e.g. an end dialog) — more than
// a single page, but not a complete flow.
export const SCENES: CatalogEntry[] = [
  {
    id: 'flip',
    kind: 'scene',
    title: 'Flip',
    description: {
      en: 'The Flip page as a scene — a copy kept to grow extra states.',
      zh: '以场景呈现的 Flip 页面——页面副本，留作叠加额外状态。',
    },
    status: 'ready',
    variants: [DEFAULT_VARIANT],
  },
]

export const COMPONENTS: CatalogEntry[] = [
  {
    id: 'flip-card',
    kind: 'component',
    title: 'FlipCard',
    description: {
      en: 'Two-sided card with front / back faces.',
      zh: '双面卡片，正反两面。',
    },
    status: 'ready',
    variants: [
      DEFAULT_VARIANT,
      { id: 'swap', name: { en: 'Swap', zh: '换面' } },
    ],
  },
  {
    id: 'book-panel',
    kind: 'component',
    title: 'BookPanel',
    description: {
      en: 'Book detail: rename title, this-round word list, start action.',
      zh: '书籍详情：改名、本轮词表、开始按钮。',
    },
    status: 'ready',
    variants: [DEFAULT_VARIANT],
  },
]
