import { useState, type CSSProperties } from 'react'
import BackButton from '../../components/BackButton'
import { useI18n } from '../../i18n'
import { BOOKS, LANGS, type Book, type LangId } from './data'
import './booksIndex.css'

const fmt = (n: number) => n.toLocaleString('en-US')
const pctOf = (b: Book) => Math.round((b.learned / b.total) * 100)
const PACE = 25

/** One accent per language, kept inside the forest palette. */
const LANG_COLOR: Record<LangId, string> = {
  en: '#8fdca0',
  zh: '#c9bb8e',
  ja: '#d98b7a',
  ko: '#8fa9c9',
}

function Tick() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

/** 02 — Index. A flat data sheet for the picked list; the rail is a compact
 *  two-column index of every list, each showing its own progress. */
export default function BooksIndex() {
  const { lang, t } = useI18n()
  const [tab, setTab] = useState<LangId>('en')
  const [pickedId, setPickedId] = useState('en-cet4')
  const [cut, setCut] = useState<string[]>([])

  const list = BOOKS.filter((b) => b.lang === tab)
  const picked = BOOKS.find((b) => b.id === pickedId) ?? list[0]

  const nameOf = (b: Book) => b.name[lang]
  const nameById = (id: string) => {
    const b = BOOKS.find((x) => x.id === id)
    return b ? nameOf(b) : id
  }
  const langLabel = (id: LangId) => LANGS.find((l) => l.id === id)?.label ?? id

  const pickLang = (id: LangId) => {
    setTab(id)
    setCut([])
    const first = BOOKS.find((b) => b.lang === id)
    if (first) setPickedId(first.id)
  }

  const toggle = (id: string) =>
    setCut((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))

  if (!picked) return null

  const candidates = picked.excludes ?? []
  const saved = candidates
    .filter((c) => cut.includes(c.id))
    .reduce((sum, c) => sum + c.covers, 0)
  const effective = Math.max(0, picked.total - saved)
  const days = Math.ceil(effective / PACE)

  const learnedW = (picked.learned / picked.total) * 100
  const cutW = (saved / picked.total) * 100
  const accent = LANG_COLOR[picked.lang]

  return (
    <div className="bi-page">
      <BackButton />

      <header className="bi-head">
        <div className="bi-head-copy">
          <h1 className="bi-title">{t('books.title')}</h1>
          <p className="bi-desc">{t('books.index.desc')}</p>
        </div>
        <div className="bi-langs" role="tablist" aria-label={t('books.title')}>
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={tab === l.id}
              className={`bi-lang${tab === l.id ? ' on' : ''}`}
              onClick={() => pickLang(l.id)}
            >
              {l.label}
              <em>{BOOKS.filter((b) => b.lang === l.id).length}</em>
            </button>
          ))}
        </div>
      </header>

      <div className="bi-body">
        {/* the data sheet */}
        <main className="bi-sheet">
          <header className="bi-sheet-head">
            <span
              className="bi-chip"
              style={{ background: accent }}
              aria-hidden="true"
            />
            <div className="bi-sheet-id">
              <span className="bi-kicker">{t('books.current')}</span>
              <h2 className="bi-name">{nameOf(picked)}</h2>
              <span className="bi-sub">
                {langLabel(picked.lang)} · {fmt(picked.total)}{' '}
                {t('books.words')}
              </span>
            </div>
            <span className="bi-pct">{pctOf(picked)}%</span>
          </header>

          {/* how the list splits: learned · excluded · still to learn */}
          <section className="bi-cap">
            <div className="bi-cap-bar" aria-hidden="true">
              <span
                className="bi-seg bi-seg-learned"
                style={{ width: `${learnedW}%` }}
              />
              <span
                className="bi-seg bi-seg-cut"
                style={{ width: `${cutW}%` }}
              />
            </div>
            <div className="bi-legend">
              <span className="bi-leg">
                <i className="bi-dot bi-dot-learned" />
                {t('books.index.learned')}
                <b>{fmt(picked.learned)}</b>
              </span>
              <span className="bi-leg">
                <i className="bi-dot bi-dot-cut" />
                {t('books.index.excluded')}
                <b>{fmt(saved)}</b>
              </span>
              <span className="bi-leg">
                <i className="bi-dot bi-dot-left" />
                {t('books.index.effective')}
                <b style={{ color: accent }}>{fmt(effective)}</b>
              </span>
            </div>
          </section>

          <div className="bi-result">
            <span className="bi-result-num" style={{ color: accent }}>
              {fmt(effective)}
            </span>
            <span className="bi-result-unit">{t('books.words')}</span>
            <span className="bi-result-pace">
              {t('books.index.pace')} <b>{days}</b> {t('books.index.days')}
            </span>
          </div>

          <section className="bi-trim-block">
            <div className="bi-trim-head">
              <h3 className="bi-trim-title">{t('books.customize')}</h3>
              <p className="bi-trim-desc">{t('books.customizeDesc')}</p>
            </div>

            {candidates.length > 0 ? (
              <ul className="bi-trims">
                {candidates.map((c) => {
                  const on = cut.includes(c.id)
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        className={`bi-trim${on ? ' on' : ''}`}
                        aria-pressed={on}
                        onClick={() => toggle(c.id)}
                      >
                        <span className="bi-trim-tick" aria-hidden="true">
                          {on ? <Tick /> : null}
                        </span>
                        <span className="bi-trim-name">{nameById(c.id)}</span>
                        <span className="bi-trim-cut">−{fmt(c.covers)}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="bi-trim-empty">{t('books.noTrim')}</p>
            )}
          </section>
        </main>

        {/* the index rail */}
        <aside className="bi-rail">
          <div className="bi-rail-head">
            <span>{t('books.index.lists')}</span>
            <em>{list.length}</em>
          </div>

          <div className="bi-grid">
            {list.map((b) => {
              const on = b.id === pickedId
              const color = LANG_COLOR[b.lang]
              return (
                <button
                  key={b.id}
                  type="button"
                  className={`bi-card${on ? ' on' : ''}`}
                  aria-pressed={on}
                  style={{ '--accent-lang': color } as CSSProperties}
                  onClick={() => {
                    setPickedId(b.id)
                    setCut([])
                  }}
                >
                  <span className="bi-card-bar" aria-hidden="true">
                    <span style={{ width: `${pctOf(b)}%` }} />
                  </span>
                  <span className="bi-card-name">{nameOf(b)}</span>
                  <span className="bi-card-foot">
                    <span className="bi-card-count">{fmt(b.total)}</span>
                    <span className="bi-card-pct">{pctOf(b)}%</span>
                  </span>
                </button>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
