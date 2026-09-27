export type FontSpec = {
  id: string
  cssVar: string
  family: string
  role: { en: string; zh: string }
  note: { en: string; zh: string }
  stack: string
}

/** The three stacks declared in tokens.css, in the order they are used. */
export const FONTS: FontSpec[] = [
  {
    id: 'ui',
    cssVar: '--font-ui',
    family: 'System Sans',
    role: { en: 'Sans', zh: '无衬线' },
    note: { en: 'Body copy, controls and dialogs.', zh: '正文、控件与弹窗。' },
    stack: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'display',
    cssVar: '--font-display',
    family: 'Noto Serif',
    role: { en: 'Serif', zh: '衬线' },
    note: {
      en: 'Headings, word cards and the catalog.',
      zh: '标题、卡片单词与目录。',
    },
    stack: 'Noto Serif CJK SC, Iowan Old Style, Palatino, Georgia, serif',
  },
  {
    id: 'mono',
    cssVar: '--font-mono',
    family: 'System Mono',
    role: { en: 'Monospace', zh: '等宽' },
    note: { en: 'Hex values, indices and code.', zh: '色值、编号与代码。' },
    stack: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
]
