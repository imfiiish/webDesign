import { useRef, useState, type CSSProperties } from 'react'
import BackButton from '../../components/BackButton'
import { useI18n } from '../../i18n'
import { BOOKS, LANGS, type Book, type LangId } from './data'
import './booksOpen.css'

const fmt = (n: number) => n.toLocaleString('en-US')
const pctOf = (b: Book) => Math.round((b.learned / b.total) * 100)

/** Split a list into rows of `n` so the shelf can draw a board under each. */
const chunk = <T,>(list: T[], n: number): T[][] => {
  const rows: T[][] = []
  for (let i = 0; i < list.length; i += n) rows.push(list.slice(i, i + n))
  return rows
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

type Fly = {
  book: Book
  left: number
  top: number
  width: number
  height: number
  dx: number
  dy: number
  sx: number
  sy: number
}

/** 01 — Open book. The picked list is a spread: identity on the verso, its
 *  table of contents on the recto. Picking from the shelf turns the page. */
export default function BooksOpen() {
  const { lang, t } = useI18n()
  const [tab, setTab] = useState<LangId>('en')
  const [pickedId, setPickedId] = useState('en-cet4')
  const [cut, setCut] = useState<string[]>([])
  const [fly, setFly] = useState<Fly | null>(null)

  const versoRef = useRef<HTMLDivElement>(null)

  const list = BOOKS.filter((b) => b.lang === tab)
  const picked = BOOKS.find((b) => b.id === pickedId) ?? list[0]

  const candidates = picked?.excludes ?? []
  const saved = candidates
    .filter((c) => cut.includes(c.id))
    .reduce((sum, c) => sum + c.covers, 0)
  const effective = Math.max(0, (picked?.total ?? 0) - saved)

  const nameOf = (b: Book) => b.name[lang]
  const nameById = (id: string) => {
    const b = BOOKS.find((x) => x.id === id)
    return b ? nameOf(b) : id
  }

  const pickLang = (id: LangId) => {
    setTab(id)
    setCut([])
    const first = BOOKS.find((b) => b.lang === id)
    if (first) setPickedId(first.id)
  }

  /** Lift the tapped cover, then let it land on the open book's verso. */
  const pickBook = (b: Book, el: HTMLElement) => {
    setPickedId(b.id)
    setCut([])

    const verso = versoRef.current
    if (!verso) return
    const from = el.getBoundingClientRect()
    const to = verso.getBoundingClientRect()
    setFly({
      book: b,
      left: from.left,
      top: from.top,
      width: from.width,
      height: from.height,
      dx: to.left - from.left,
      dy: to.top - from.top,
      sx: to.width / from.width,
      sy: to.height / from.height,
    })
    window.setTimeout(() => setFly(null), 520)
  }

  const toggle = (id: string) =>
    setCut((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))

  if (!picked) return null

  const pct = pctOf(picked)
  const rows = chunk(list, 2)

  return (
    <div className="bo-page">
      <BackButton />

      <header className="bo-head">
        <h1 className="bo-title">{t('books.title')}</h1>
        <p className="bo-desc">{t('books.open.desc')}</p>
      </header>

      <div className="bo-body">
        {/* the desk: an open book */}
        <main className="bo-desk">
          <span className="bo-lamp" aria-hidden="true" />
          <div className="bo-book" key={picked.id}>
            <span className="bo-gutter" aria-hidden="true" />

            {/* verso — who the list is */}
            <section className="bo-page bo-verso">
              <span className="bo-ribbon" aria-hidden="true">
                <span className="bo-ribbon-pct">{pct}%</span>
              </span>

              <div className="bo-verso-cover" ref={versoRef}>
                <span className="bo-cover-spine" aria-hidden="true">
                  <span style={{ height: `${pct}%` }} />
                </span>
                <span className="bo-cover-name">{nameOf(picked)}</span>
                <span className="bo-cover-meta">
                  {fmt(picked.learned)} / {fmt(picked.total)}
                </span>
              </div>

              <span className="bo-kicker">{t('books.current')}</span>
              <h2 className="bo-name">{nameOf(picked)}</h2>
              <div className="bo-progress">
                <span className="bo-progress-track">
                  <span style={{ width: `${pct}%` }} />
                </span>
                <span className="bo-progress-meta">
                  {fmt(picked.learned)} / {fmt(picked.total)} {t('books.words')}
                </span>
              </div>
            </section>

            {/* recto — what to keep */}
            <section className="bo-page bo-recto">
              <span className="bo-kicker">{t('books.open.contents')}</span>
              <h3 className="bo-contents-title">{t('books.customize')}</h3>
              <p className="bo-contents-note">{t('books.open.note')}</p>

              {candidates.length > 0 ? (
                <ul className="bo-chapters">
                  {candidates.map((c) => {
                    const on = cut.includes(c.id)
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          className={`bo-chapter${on ? ' on' : ''}`}
                          aria-pressed={on}
                          onClick={() => toggle(c.id)}
                        >
                          <span className="bo-chapter-tick" aria-hidden="true">
                            {on ? <Tick /> : null}
                          </span>
                          <span className="bo-chapter-name">
                            {nameById(c.id)}
                          </span>
                          <span className="bo-chapter-lead" aria-hidden="true" />
                          <span className="bo-chapter-cut">
                            −{fmt(c.covers)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="bo-empty">{t('books.noTrim')}</p>
              )}

              <div className="bo-sum">
                <span className="bo-sum-eq">
                  {fmt(picked.total)} − {fmt(saved)} =
                </span>
                <b className="bo-sum-eff">{fmt(effective)}</b>
                <span className="bo-sum-unit">{t('books.words')}</span>
              </div>
            </section>
          </div>
        </main>

        {/* the shelf on the right */}
        <aside className="bo-rail">
          <div className="bo-langs" role="tablist" aria-label={t('books.title')}>
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={tab === l.id}
                className={`bo-lang${tab === l.id ? ' on' : ''}`}
                onClick={() => pickLang(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="bo-shelf">
            {rows.map((row, i) => (
              <div className="bo-row" key={i}>
                {row.map((b) => {
                  const on = b.id === pickedId
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className={`bo-mini${on ? ' on' : ''}`}
                      aria-pressed={on}
                      onClick={(e) => pickBook(b, e.currentTarget)}
                    >
                      <span className="bo-spine" aria-hidden="true">
                        <span style={{ height: `${pctOf(b)}%` }} />
                      </span>
                      {on && (
                        <span className="bo-mark" aria-hidden="true">
                          <Tick />
                        </span>
                      )}
                      <span className="bo-mini-name">{nameOf(b)}</span>
                      <span className="bo-mini-meta">
                        {fmt(b.learned)}/{fmt(b.total)}
                      </span>
                    </button>
                  )
                })}
                <span className="bo-board" aria-hidden="true" />
              </div>
            ))}
          </div>
        </aside>
      </div>

      {fly && (
        <div
          className="bo-fly"
          aria-hidden="true"
          style={
            {
              left: fly.left,
              top: fly.top,
              width: fly.width,
              height: fly.height,
              '--dx': `${fly.dx}px`,
              '--dy': `${fly.dy}px`,
              '--sx': `${fly.sx}`,
              '--sy': `${fly.sy}`,
            } as CSSProperties
          }
        >
          <span className="bo-spine" aria-hidden="true">
            <span style={{ height: `${pctOf(fly.book)}%` }} />
          </span>
          <span className="bo-mini-name">{nameOf(fly.book)}</span>
          <span className="bo-mini-meta">
            {fmt(fly.book.learned)}/{fmt(fly.book.total)}
          </span>
        </div>
      )}
    </div>
  )
}
