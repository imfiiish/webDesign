import { useState, type CSSProperties } from 'react'
import BackButton from '../../components/BackButton'
import Modal from '../../components/Modal'
import { useI18n } from '../../i18n'
import { BOOKS, LANGS, type Book, type LangId } from './data'
import './books.css'

const fmt = (n: number) => n.toLocaleString('en-US')
const pctOf = (b: Book) => Math.round((b.learned / b.total) * 100)

/** One accent per language, kept inside the forest palette. */
const LANG_COLOR: Record<LangId, string> = {
  en: '#8fdca0',
  zh: '#c9bb8e',
  ja: '#d98b7a',
  ko: '#8fa9c9',
}

function Check() {
  return (
    <svg
      width="14"
      height="14"
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

function Sliders() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="16" x2="20" y2="16" />
      <circle cx="9" cy="8" r="2.4" />
      <circle cx="15" cy="16" r="2.4" />
    </svg>
  )
}

/** The Wordbooks page. The left panel is the picked list — total / learned /
 *  exposed, a study action and a customize dialog; the right rail is the
 *  index of every list. Appearance + local state only. */
export default function Books() {
  const { lang, t } = useI18n()
  const [tab, setTab] = useState<LangId>('en')
  const [pickedId, setPickedId] = useState('en-cet4')
  const [learningId, setLearningId] = useState<string | null>(null)
  const [cut, setCut] = useState<string[]>([])
  const [added, setAdded] = useState<string[]>([])
  const [dialog, setDialog] = useState(false)

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
    setAdded([])
    const first = BOOKS.find((b) => b.lang === id)
    if (first) setPickedId(first.id)
  }

  const pickBook = (b: Book) => {
    setPickedId(b.id)
    setCut([])
    setAdded([])
  }

  const toggleCut = (id: string) =>
    setCut((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  const toggleAdded = (id: string) =>
    setAdded((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))

  if (!picked) return null

  const learning = learningId === picked.id
  const excludes = picked.excludes ?? []
  const addons = picked.addons ?? []
  const saved = excludes
    .filter((c) => cut.includes(c.id))
    .reduce((sum, c) => sum + c.covers, 0)
  const gained = addons
    .filter((c) => added.includes(c.id))
    .reduce((sum, c) => sum + c.covers, 0)
  const adjusted = Math.max(0, picked.total - saved + gained)
  const customized = saved > 0 || gained > 0
  const accent = LANG_COLOR[picked.lang]

  const toggleLearning = () =>
    setLearningId((id) => (id === picked.id ? null : picked.id))

  return (
    <div className="bi-page">
      <BackButton />

      <header className="bi-head">
        <div className="bi-head-copy">
          <h1 className="bi-title">{t('books.title')}</h1>
          <p className="bi-desc">{t('books.desc')}</p>
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
        {/* the picked list */}
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

          <div className="bi-stats">
            <div className="bi-stat">
              <span>{t('books.total')}</span>
              <b>{fmt(picked.total)}</b>
            </div>
            <div className="bi-stat">
              <span>{t('books.learned')}</span>
              <b>{fmt(picked.learned)}</b>
            </div>
            <div className="bi-stat">
              <span>{t('books.exposed')}</span>
              <b>{fmt(picked.exposed)}</b>
            </div>
          </div>

          <div className="bi-meter">
            <span className="bi-meter-track" aria-hidden="true">
              <span style={{ width: `${pctOf(picked)}%`, background: accent }} />
            </span>
            <span className="bi-meter-meta">
              {fmt(picked.learned)} / {fmt(picked.total)} {t('books.words')}
            </span>
          </div>

          {customized && (
            <div className="bi-adjust">
              <span className="bi-adjust-dot" style={{ background: accent }} />
              {t('books.customized')} · {t('books.adjusted')}{' '}
              <b>{fmt(adjusted)}</b> {t('books.words')}
            </div>
          )}

          <div className="bi-actions">
            <button
              type="button"
              className={`bi-start${learning ? ' on' : ''}`}
              aria-pressed={learning}
              onClick={toggleLearning}
            >
              <span className="bi-start-ico" aria-hidden="true">
                {learning ? <Check /> : null}
              </span>
              {learning ? t('books.studying') : t('books.start')}
            </button>
            <button
              type="button"
              className="bi-custom"
              onClick={() => setDialog(true)}
            >
              <Sliders />
              {t('books.customize')}
            </button>
          </div>
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
              const isLearning = b.id === learningId
              const color = LANG_COLOR[b.lang]
              return (
                <button
                  key={b.id}
                  type="button"
                  className={`bi-card${on ? ' on' : ''}`}
                  aria-pressed={on}
                  style={{ '--accent-lang': color } as CSSProperties}
                  onClick={() => pickBook(b)}
                >
                  <span className="bi-card-top">
                    <span className="bi-card-bar" aria-hidden="true">
                      <span style={{ width: `${pctOf(b)}%` }} />
                    </span>
                    {isLearning && (
                      <span className="bi-card-tag">{t('books.studying')}</span>
                    )}
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

      {dialog && (
        <Modal
          onClose={() => setDialog(false)}
          ariaLabel={t('books.customize')}
          className="bi-dialog"
        >
          <header className="bi-dlg-head">
            <span
              className="bi-chip bi-dlg-chip"
              style={{ background: accent }}
              aria-hidden="true"
            />
            <div className="bi-dlg-id">
              <span className="bi-dlg-kicker">{t('books.customize')}</span>
              <h2 className="bi-dlg-name">{nameOf(picked)}</h2>
              <p className="bi-dlg-desc">{t('books.customizeDesc')}</p>
            </div>
            <div className="bi-dlg-live">
              <b style={{ color: accent }}>{fmt(adjusted)}</b>
              <span>{t('books.words')}</span>
            </div>
          </header>

          <div className="bi-groups">
            <section className="bi-group">
              <header className="bi-group-head">
                <h3>{t('books.exclude')}</h3>
                <span className="bi-group-hint">{t('books.excludeHint')}</span>
              </header>
              {excludes.length > 0 ? (
                <ul className="bi-cands">
                  {excludes.map((c) => {
                    const on = cut.includes(c.id)
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          className={`bi-cand${on ? ' on' : ''}`}
                          aria-pressed={on}
                          onClick={() => toggleCut(c.id)}
                        >
                          <span className="bi-cand-tick" aria-hidden="true">
                            {on ? <Check /> : null}
                          </span>
                          <span className="bi-cand-name">{nameById(c.id)}</span>
                          <span className="bi-cand-words">
                            −{fmt(c.covers)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="bi-group-empty">{t('books.noTrim')}</p>
              )}
            </section>

            <section className="bi-group">
              <header className="bi-group-head">
                <h3>{t('books.add')}</h3>
                <span className="bi-group-hint">{t('books.addHint')}</span>
              </header>
              {addons.length > 0 ? (
                <ul className="bi-cands">
                  {addons.map((c) => {
                    const on = added.includes(c.id)
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          className={`bi-cand bi-cand-add${on ? ' on' : ''}`}
                          aria-pressed={on}
                          onClick={() => toggleAdded(c.id)}
                        >
                          <span className="bi-cand-tick" aria-hidden="true">
                            {on ? <Check /> : null}
                          </span>
                          <span className="bi-cand-name">{nameById(c.id)}</span>
                          <span className="bi-cand-words">
                            +{fmt(c.covers)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="bi-group-empty">{t('books.noAdd')}</p>
              )}
            </section>
          </div>

          <footer className="bi-dlg-foot">
            <span className="bi-dlg-eq">
              {fmt(picked.total)} − {fmt(saved)} + {fmt(gained)} =
              <b style={{ color: accent }}>{fmt(adjusted)}</b>
              <em>{t('books.words')}</em>
            </span>
            <button
              type="button"
              className="bi-dialog-done"
              onClick={() => setDialog(false)}
            >
              {t('common.done')}
            </button>
          </footer>
        </Modal>
      )}
    </div>
  )
}
