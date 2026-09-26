// Single source of truth for the design catalog.
// Appearance only — no business logic. `title` is a proper noun (kept as-is);
// the description is bilingual.

export type EntryKind = 'page' | 'component'
export type EntryStatus = 'ready' | 'planned'

export type CatalogEntry = {
  id: string
  kind: EntryKind
  title: string
  description: { en: string; zh: string }
  status: EntryStatus
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
  },
  {
    id: 'fonts',
    kind: 'component',
    title: 'Fonts',
    description: {
      en: 'The catalog names set large in the display face.',
      zh: '用展示字体排出的字体样张。',
    },
    status: 'ready',
  },
]
