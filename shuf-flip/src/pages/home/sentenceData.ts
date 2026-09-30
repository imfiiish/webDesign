// Sentence-fill demo data.
// Fields mirror hsk1_sentences.json exactly (order / word / pinyin / pos /
// sentence / translation / tokens / grammar / deps / note). Entries 212 and
// 147 are embedded verbatim as the template for Creative › Sentence, and the
// array order is the loop order (212 → 147 → 212 …). 147 is here because 一
// (yī) is a prefix of 衣服 (yīfu), which exercises pinyin-overlap matching.

export type SentenceToken = {
  /** 中文词 (text) */
  text: string
  /** 拼音 (pinyin) */
  pinyin: string
  /** 本句语境英文 (en) */
  en: string
  /** 词典本义 (base) */
  base: string
  /** 句法角色 (role) */
  role: string
}

export type SentenceEntry = {
  order: number
  word: string
  pinyin: string
  pos: string
  sentence: string
  translation: string
  tokens: SentenceToken[]
  grammar: string[]
  deps: string[]
  note: string | null
}

const S212: SentenceEntry = {
  order: 212,
  word: '买',
  pinyin: 'mǎi',
  pos: 'verb',
  sentence: '我买了一个苹果。',
  translation: 'I bought an apple.',
  tokens: [
    { text: '我', pinyin: 'wǒ', en: 'I', base: 'I / me', role: 'subject' },
    {
      text: '买',
      pinyin: 'mǎi',
      en: 'bought',
      base: 'to buy',
      role: 'predicate',
    },
    {
      text: '了',
      pinyin: 'le',
      en: '(past)',
      base: '(change-of-state particle)',
      role: 'particle',
    },
    { text: '一', pinyin: 'yī', en: 'an', base: 'one', role: 'numeral' },
    {
      text: '个',
      pinyin: 'gè',
      en: '(mw.)',
      base: '(general measure word)',
      role: 'measure',
    },
    {
      text: '苹果',
      pinyin: 'píngguǒ',
      en: 'apple',
      base: 'apple',
      role: 'object',
    },
  ],
  grammar: ['完成态“了1”', '数量短语'],
  deps: ['我', '个', '一', '了', '苹果'],
  note: null,
}

const S147: SentenceEntry = {
  order: 147,
  word: '件',
  pinyin: 'jiàn',
  pos: 'measure',
  sentence: '这是一件衣服。',
  translation: 'This is a piece of clothing.',
  tokens: [
    { text: '这', pinyin: 'zhè', en: 'this', base: 'this', role: 'subject' },
    { text: '是', pinyin: 'shì', en: 'is', base: 'to be', role: 'predicate' },
    { text: '一', pinyin: 'yī', en: 'a', base: 'one', role: 'numeral' },
    {
      text: '件',
      pinyin: 'jiàn',
      en: '(mw.)',
      base: '(mw. for clothes/matters)',
      role: 'measure',
    },
    {
      text: '衣服',
      pinyin: 'yīfu',
      en: 'piece of clothing',
      base: 'clothes',
      role: 'object',
    },
  ],
  grammar: ['量词“件”', '数量短语'],
  deps: ['是', '这', '一', '衣服'],
  note: null,
}

export const SENTENCES: SentenceEntry[] = [S212, S147]
