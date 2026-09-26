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
    status: 'planned',
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
    id: 'flip-deck',
    kind: 'component',
    title: 'FlipDeck',
    description: {
      en: 'Ring stage: layout, scale, hover glow, flip.',
      zh: '环形舞台：布局、缩放、悬浮光晕、翻转。',
    },
    status: 'planned',
  },
  {
    id: 'flip-card',
    kind: 'component',
    title: 'FlipCard',
    description: {
      en: 'Two-sided card with front / back faces.',
      zh: '双面卡片，正反两面。',
    },
    status: 'planned',
  },
  {
    id: 'progress-dots',
    kind: 'component',
    title: 'ProgressDots',
    description: {
      en: 'Three reveal-count dots, green to red.',
      zh: '三个展开次数圆点，绿 → 红。',
    },
    status: 'planned',
  },
  {
    id: 'hint-bar',
    kind: 'component',
    title: 'HintBar',
    description: {
      en: 'Bottom key hints, fixed and stage-aligned.',
      zh: '底部键位提示，固定并与舞台对齐。',
    },
    status: 'planned',
  },
  {
    id: 'rating-bar',
    kind: 'component',
    title: 'RatingBar',
    description: {
      en: 'Familiar / unsure / unfamiliar buttons.',
      zh: '熟悉 / 模糊 / 陌生按钮。',
    },
    status: 'planned',
  },
  {
    id: 'shelf-item',
    kind: 'component',
    title: 'ShelfItem',
    description: {
      en: 'Book cover with spine fill and page edges.',
      zh: '书封，带书脊填充与页边线。',
    },
    status: 'planned',
  },
  {
    id: 'shelf-dialog',
    kind: 'component',
    title: 'ShelfDialog',
    description: {
      en: 'Book detail: word list and side actions.',
      zh: '词书详情：词表与右侧操作。',
    },
    status: 'planned',
  },
  {
    id: 'tag-picker',
    kind: 'component',
    title: 'TagPicker',
    description: {
      en: 'Include / exclude tag chips with count.',
      zh: '包含 / 排除标签，带实时计数。',
    },
    status: 'planned',
  },
  {
    id: 'shortcut-help',
    kind: 'component',
    title: 'ShortcutHelp',
    description: {
      en: 'Mouse / keyboard / trackpad modal.',
      zh: '鼠标 / 键盘 / 触控板帮助弹窗。',
    },
    status: 'planned',
  },
  {
    id: 'settings-dialog',
    kind: 'component',
    title: 'SettingsDialog',
    description: {
      en: 'Segmented control in a modal.',
      zh: '弹窗里的分段选择器。',
    },
    status: 'planned',
  },
  {
    id: 'modal',
    kind: 'component',
    title: 'Modal',
    description: {
      en: 'Backdrop, close button, Esc to dismiss.',
      zh: '遮罩、关闭按钮、Esc 关闭。',
    },
    status: 'planned',
  },
  {
    id: 'icon-button',
    kind: 'component',
    title: 'IconButton',
    description: {
      en: 'Round icon button and corner placements.',
      zh: '圆形图标按钮及其四角布局。',
    },
    status: 'planned',
  },
  {
    id: 'theme-toggle',
    kind: 'component',
    title: 'ThemeToggle',
    description: {
      en: 'Auto / light / dark cycle button.',
      zh: '自动 / 亮 / 暗 循环按钮。',
    },
    status: 'planned',
  },
  {
    id: 'back-button',
    kind: 'component',
    title: 'BackButton',
    description: {
      en: 'Top-left icon button.',
      zh: '左上角图标按钮。',
    },
    status: 'planned',
  },
  {
    id: 'icons',
    kind: 'component',
    title: 'Icons',
    description: {
      en: 'Inline SVG icon set.',
      zh: '内联 SVG 图标集。',
    },
    status: 'planned',
  },
]
