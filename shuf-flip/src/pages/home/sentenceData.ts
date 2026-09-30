// Sentence-fill demo data.
// Fields mirror hsk1_sentences.json exactly (order / word / pinyin / pos /
// sentence / translation / tokens / grammar / deps / note). Entries 212 and
// 280 are embedded verbatim as the template for Creative › Sentence, and the
// array order is the loop order (212 → 280 → 212 …).

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

const S280: SentenceEntry = {
  order: 280,
  word: '怎么',
  pinyin: 'zěnme',
  pos: 'pron',
  sentence: '你怎么去学校？',
  translation: 'How do you go to school?',
  tokens: [
    { text: '你', pinyin: 'nǐ', en: 'you', base: 'you', role: 'subject' },
    {
      text: '怎么',
      pinyin: 'zěnme',
      en: 'how',
      base: 'how',
      role: 'adverbial',
    },
    { text: '去', pinyin: 'qù', en: 'go', base: 'to go', role: 'predicate' },
    {
      text: '学校',
      pinyin: 'xuéxiào',
      en: 'to school',
      base: 'school',
      role: 'object',
    },
  ],
  grammar: ['特指疑问句'],
  deps: ['你', '学校', '去'],
  note: null,
}

export const SENTENCES: SentenceEntry[] = [S212, S280]
