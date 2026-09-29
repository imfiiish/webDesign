import { createContext, useContext } from 'react'

// Lightweight i18n: a flat dictionary + a persisted language.
// The provider component lives in components/I18nProvider.tsx so this file
// only exports non-components.

export type Lang = 'zh' | 'en'

const KEY = 'design-lang'

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    'mode.overview': 'Overview',
    'mode.page': 'Page',
    'mode.components': 'Components',
    'mode.design': 'Design',
    'mode.creative': 'Creative',
    'design.colors': 'Colors',
    'design.fonts': 'Fonts',
    'design.animations': 'Animations',
    'anim.flip': 'Flip',
    'kind.page': 'Page',
    'kind.component': 'Component',
    'panel.preview': 'preview area',
    'login.username': 'username',
    'login.usernameHint':
      '3–20 chars, start with a letter, lowercase letters and digits only',
    'login.passwordAria': 'password',
    'login.passwordLabel': 'Re-enter password',
    'login.needDigits': 'Digits only',
    'login.mismatch': "Passwords don't match, try again",
    'login.enter': 'Enter',
    'login.confirm': 'Confirm',
    'login.register': 'Register',
    'login.back': 'Back',
    'login.guest': 'Just browsing',
    'nav.back': 'Back to catalog',
    'flip.next': 'Next round',
    'flip.reveal': 'Show definition',
    'flip.replay': 'Hide definition',
    'rating.unknown': 'Unfamiliar',
    'rating.fuzzy': 'Unsure',
    'rating.known': 'Familiar',
    'rating.skip': 'Skip test',
    'rating.skipConfirm': 'Click again to skip',
    'common.close': 'Close',
    'common.copied': 'Copied',
    'shelf.words': 'words',
    'shelf.addBook': 'New book',
    'shelf.delete': 'Delete',
    'shelf.confirmDelete': 'Click again to confirm',
    'shelf.newBook': 'Book',
    'shelf.thisRound': 'This round',
    'shelf.copyPlay': 'Click to copy',
    'shelf.start': 'Start studying',
    'shelf.nameAria': 'Book name',
    'shelf.namePlaceholder': 'Book',
    'shelf.nameEditTitle': 'Click to rename',
    'lang.toggle': 'Language: English. Click to switch to Chinese.',
  },
  zh: {
    'mode.overview': '概览',
    'mode.page': '页面',
    'mode.components': '组件',
    'mode.design': '设计',
    'mode.creative': '创意',
    'design.colors': '颜色',
    'design.fonts': '字体',
    'design.animations': '动画',
    'anim.flip': '翻卡',
    'kind.page': '页面',
    'kind.component': '组件',
    'panel.preview': '预览区',
    'login.username': '账号',
    'login.usernameHint': '3–20 位，字母开头，仅小写字母与数字',
    'login.passwordAria': '密码',
    'login.passwordLabel': '再输入密码',
    'login.needDigits': '请输入数字',
    'login.mismatch': '两次不一致，请重输',
    'login.enter': '进入',
    'login.confirm': '确认',
    'login.register': '注册',
    'login.back': '返回',
    'login.guest': '随便看看',
    'nav.back': '返回目录',
    'flip.next': '下一轮',
    'flip.reveal': '显示释义',
    'flip.replay': '收起释义',
    'rating.unknown': '陌生',
    'rating.fuzzy': '模糊',
    'rating.known': '熟悉',
    'rating.skip': '跳过测验',
    'rating.skipConfirm': '再点一次确认跳过',
    'common.close': '关闭',
    'common.copied': '已复制',
    'shelf.words': '词',
    'shelf.addBook': '新建词书',
    'shelf.delete': '删除',
    'shelf.confirmDelete': '再点一次确认删除',
    'shelf.newBook': '词书',
    'shelf.thisRound': '本轮',
    'shelf.copyPlay': '点击复制',
    'shelf.start': '开始学习',
    'shelf.nameAria': '词书名称',
    'shelf.namePlaceholder': '词书',
    'shelf.nameEditTitle': '点击修改名称',
    'lang.toggle': '语言：中文。点击切换到 English。',
  },
}

export function detectLang(): Lang {
  const saved = localStorage.getItem(KEY)
  if (saved === 'zh' || saved === 'en') return saved
  const nav = typeof navigator !== 'undefined' ? navigator.language || '' : ''
  return nav.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export function saveLang(lang: Lang): void {
  localStorage.setItem(KEY, lang)
}

export function tFor(lang: Lang, key: string): string {
  return DICT[lang][key] ?? DICT.en[key] ?? key
}

export type I18nCtx = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

export const I18nContext = createContext<I18nCtx | null>(null)

export function useI18n(): I18nCtx {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
