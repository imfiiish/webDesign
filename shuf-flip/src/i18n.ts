import { createContext, useContext } from 'react'

// Lightweight i18n: a flat dictionary + a persisted language.
// The provider component lives in components/I18nProvider.tsx so this file
// only exports non-components.

export type Lang = 'zh' | 'en'

const KEY = 'design-lang'

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    'mode.overview': 'Overview',
    'mode.scenes': 'Scenes',
    'mode.page': 'Page',
    'mode.components': 'Components',
    'mode.design': 'Design',
    'mode.creative': 'Creative',
    'design.colors': 'Colors',
    'design.fonts': 'Fonts',
    'design.misc': 'Misc',
    'anim.flip': 'FlipCard:animations',
    'anim.promptCard': 'SentenceCard:animations',
    'anim.boxStyles': 'SentenceBox:styles',
    'anim.blankStyles': 'SentenceBlanks:styles',
    'creative.sentence': 'Sentence',
    'sentence.howto': 'Type pinyin, Space to place',
    'sentence.nextBlank': 'next blank',
    'sentence.place': 'place',
    'sentence.submit': 'submit',
    'sentence.nextEntry': 'next sentence',
    'sentence.retry': 'first mistake',
    'sentence.remove': 'Click to remove',
    'kind.page': 'Page',
    'kind.scene': 'Scene',
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
    'scene.howTo': 'How to use',
    'scene.flipHint1': 'Click the center card to reveal the definition.',
    'scene.flipHint2': 'Scroll, or press H / L, to move through the deck.',
    'scene.flipHint3': 'Space reveals, Enter starts a new round.',
    'results.kicker': 'Round complete',
    'results.title': 'Nice work!',
    'results.studied': 'studied',
    'results.new': 'New',
    'results.review': 'Review',
    'results.exposed': 'Exposed',
    'results.reveals': 'reveals',
    'results.stop': 'Stop here',
    'results.continue': 'Keep learning',
    'results.ideas': 'Results: ideas',
    'results.idea.minimal': 'Minimal',
    'results.idea.dashboard': 'Dashboard',
    'results.idea.celebration': 'Celebration',
    'results.streak': 'Streak',
    'results.dailyGoal': 'Daily goal',
    'results.trail': 'Round trail',
    'results.ranking': 'Word ranking',
    'results.encountered': 'Words encountered',
    'results.idea.timeline': 'Timeline',
    'results.idea.ranking': 'Ranking',
    'results.idea.poster': 'Poster',
    'rating.unknown': 'Unfamiliar',
    'rating.fuzzy': 'Unsure',
    'rating.known': 'Familiar',
    'rating.skip': 'Skip test',
    'rating.skipConfirm': 'Click again to skip',
    'common.close': 'Close',
    'common.open': 'Open page',
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
    'mode.scenes': '场景',
    'mode.page': '页面',
    'mode.components': '组件',
    'mode.design': '设计',
    'mode.creative': '创意',
    'design.colors': '颜色',
    'design.fonts': '字体',
    'design.misc': '杂项',
    'anim.flip': 'FlipCard:animations',
    'anim.promptCard': 'SentenceCard:animations',
    'anim.boxStyles': 'SentenceBox:styles',
    'anim.blankStyles': 'SentenceBlanks:styles',
    'creative.sentence': 'Sentence',
    'sentence.howto': '输入拼音，空格填入',
    'sentence.nextBlank': '下一个空',
    'sentence.place': '填入',
    'sentence.submit': '提交',
    'sentence.nextEntry': '下一句',
    'sentence.retry': '回到第一个错',
    'sentence.remove': '点击移回词块',
    'kind.page': '页面',
    'kind.scene': '场景',
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
    'scene.howTo': '使用方法',
    'scene.flipHint1': '点击中间卡片展开释义。',
    'scene.flipHint2': '滚动，或按 H / L 前后翻牌。',
    'scene.flipHint3': '空格展开释义，回车开始新一轮。',
    'results.kicker': '本轮完成',
    'results.title': '学得不错！',
    'results.studied': '已学',
    'results.new': '新词',
    'results.review': '复习',
    'results.exposed': '曝光',
    'results.reveals': '翻开次数',
    'results.stop': '学到这里',
    'results.continue': '继续学习',
    'results.ideas': '成绩页：方案',
    'results.idea.minimal': '极简',
    'results.idea.dashboard': '仪表盘',
    'results.idea.celebration': '庆祝',
    'results.streak': '连续',
    'results.dailyGoal': '今日目标',
    'results.trail': '本轮轨迹',
    'results.ranking': '词汇榜',
    'results.encountered': '碰到的词汇',
    'results.idea.timeline': '轨迹',
    'results.idea.ranking': '词汇榜',
    'results.idea.poster': '海报',
    'rating.unknown': '陌生',
    'rating.fuzzy': '模糊',
    'rating.known': '熟悉',
    'rating.skip': '跳过测验',
    'rating.skipConfirm': '再点一次确认跳过',
    'common.close': '关闭',
    'common.open': '打开页面',
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
