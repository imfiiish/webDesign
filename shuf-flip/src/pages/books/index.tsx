import { useRef, useState, type CSSProperties } from 'react'
import BackButton from '../../components/BackButton'
import { useI18n } from '../../i18n'
import { BOOKS, LANGS, type Book, type LangId } from './data'
import './books.css'

const fmt = (n: number) => n.toLocaleString('en-US')
const pctOf = (b: Book) => Math.round((b.learned / b.total) * 100)

/** One book cover: spine with the progress rising up it, title, counts. */
function Cover({
  book,
  name,
  on,
}: {
  book: Book
  name: string
  on?: boolean
}) {
  return (
    <>
      <span className="bk-cover-spine" aria-hidden="true">
        <span style={{ height: `${pctOf(book)}%` }} />
      </span>
      {on && (
        <span className="bk-cover-check" aria-hidden="true">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      <span className="bk-cover-title">{name}</span>
      <span className="bk-cover-meta">
        <b>{fmt(book.learned)}</b> / {fmt(book.total)}
      </span>
    </>
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

/** The Wordbooks page. The right rail is the catalog (two covers a row);
 *  picking one flies it into the single slot on the main side, where it can
 *  be trimmed. Appearance + local state only. */
export default function Books() {
  const { lang, t } = useI18n()
  const [tab, setTab] = useState<LangId>('en')
  const [pickedId, setPickedId] = useState('en-cet4')
  const [cut, setCut] = useState<string[]>([])
  const [fly, setFly] = useState<Fly | null>(null)

  const heroRef = useRef<HTMLDivElement>(null)

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

  /** Fly the tapped cover into the slot, then make it the current book. */
  const pickBook = (b: Book, el: HTMLElement) => {
    setPickedId(b.id)
    setCut([])

    const hero = heroRef.current
    if (!hero) return
    const from = el.getBoundingClientRect()
    const to = hero.getBoundingClientRect()
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

  return (
    <div className="bk-page">
      <BackButton />

      <header className="bk-head">
        <h1 className="bk-title">{t('books.title')}</h1>
        <p className="bk-desc">{t('books.desc')}</p>
      </header>

      <div className="bk-body">
        {/* main — the one picked list plus its trim panel */}
        {picked && (
          <main className="bk-main">
            <section className="bk-current">
              <div className="bk-cover bk-hero" ref={heroRef}>
                <Cover book={picked} name={nameOf(picked)} />
              </div>

              <div className="bk-current-body">
                <span className="bk-current-kicker">{t('books.current')}</span>
                <h2 className="bk-current-name">{nameOf(picked)}</h2>
                <div className="bk-current-meta">
                  <span>
                    <b>{fmt(picked.learned)}</b> / {fmt(picked.total)}{' '}
                    {t('books.words')}
                  </span>
                  <span className="bk-current-pct">{pctOf(picked)}%</span>
                </div>
                <div className="bk-meter" aria-hidden="true">
                  <span style={{ width: `${pctOf(picked)}%` }} />
                </div>
              </div>
            </section>

            <section className="bk-custom">
              <h3 className="bk-custom-title">{t('books.customize')}</h3>

              {candidates.length > 0 ? (
                <>
                  <p className="bk-custom-desc">{t('books.customizeDesc')}</p>

                  <div className="bk-trims">
                    {candidates.map((c) => {
                      const on = cut.includes(c.id)
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className={`bk-trim${on ? ' on' : ''}`}
                          aria-pressed={on}
                          onClick={() => toggle(c.id)}
                        >
                          <span className="bk-trim-tick" aria-hidden="true">
                            {on ? (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : null}
                          </span>
                          <span className="bk-trim-name">{nameById(c.id)}</span>
                          <span className="bk-trim-cut">−{fmt(c.covers)}</span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="bk-sum">
                    <span className="bk-sum-total">{fmt(picked.total)}</span>
                    <span className="bk-sum-op">−</span>
                    <span className="bk-sum-cut">{fmt(saved)}</span>
                    <span className="bk-sum-op">=</span>
                    <span className="bk-sum-eff">{fmt(effective)}</span>
                    <span className="bk-sum-unit">{t('books.words')}</span>
                  </div>
                </>
              ) : (
                <p className="bk-custom-empty">{t('books.noTrim')}</p>
              )}
            </section>
          </main>
        )}

        {/* right rail — the catalog, two covers a row */}
        <aside className="bk-rail">
          <div className="bk-langs" role="tablist" aria-label={t('books.title')}>
            {LANGS.map((l) => {
              const count = BOOKS.filter((b) => b.lang === l.id).length
              return (
                <button
                  key={l.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === l.id}
                  className={`bk-lang${tab === l.id ? ' on' : ''}`}
                  onClick={() => pickLang(l.id)}
                >
                  {l.label}
                  <em>{count}</em>
                </button>
              )
            })}
          </div>

          <div className="bk-catalog">
            {list.map((b) => {
              const on = b.id === pickedId
              return (
                <button
                  key={b.id}
                  type="button"
                  className={`bk-cover${on ? ' on' : ''}`}
                  aria-pressed={on}
                  onClick={(e) => pickBook(b, e.currentTarget)}
                >
                  <Cover book={b} name={nameOf(b)} on={on} />
                </button>
              )
            })}
          </div>
        </aside>
      </div>

      {/* the cover in flight, from the rail into the slot */}
      {fly && (
        <div
          className="bk-cover bk-fly"
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
          <Cover book={fly.book} name={nameOf(fly.book)} />
        </div>
      )}
    </div>
  )
}
