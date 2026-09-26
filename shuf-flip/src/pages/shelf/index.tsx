import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n'
import ShelfDialog from './ShelfDialog'
import { BOOKS, type Book } from './data'
import './shelf.css'

/** The Shelf page: a shelf of book spines with progress, delete confirm and
 *  a detail dialog. Appearance + local state only. */
export default function Shelf() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [books, setBooks] = useState<Book[]>(BOOKS)
  const [active, setActive] = useState<Book | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const addBook = () => {
    setBooks((b) => [
      ...b,
      { id: Date.now(), name: t('shelf.newBook'), total: 0, met: 0, revealed: 0 },
    ])
  }

  return (
    <div className="shelf">
      <button
        type="button"
        className="deck-home"
        onClick={() => navigate('/')}
        aria-label={t('nav.back')}
        title={t('nav.back')}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <div className="bookshelf">
        <div className="bookshelf-inner">
          {books.map((book) => {
            const metPct = book.total ? (book.met / book.total) * 100 : 0
            const revPct = book.total ? (book.revealed / book.total) * 100 : 0
            const confirming = confirmId === book.id
            return (
              <div
                className="book-item"
                key={book.id}
                onMouseLeave={() =>
                  setConfirmId((c) => (c === book.id ? null : c))
                }
              >
                <button
                  type="button"
                  className="book"
                  onClick={() => {
                    setConfirmId(null)
                    setActive(book)
                  }}
                  title={book.name}
                >
                  <span className="spine" aria-hidden="true">
                    <span
                      className="spine-yellow"
                      style={{ height: `${metPct}%` }}
                    />
                    <span
                      className="spine-green"
                      style={{ height: `${revPct}%` }}
                    />
                  </span>
                  <span className="book-title">{book.name}</span>
                  <span className="book-meta">
                    {book.total} {t('shelf.words')}
                  </span>
                </button>

                <button
                  type="button"
                  className={`book-del${confirming ? ' confirm' : ''}`}
                  onClick={() => {
                    if (confirming) {
                      setBooks((b) => b.filter((x) => x.id !== book.id))
                      setActive((a) => (a?.id === book.id ? null : a))
                      setConfirmId(null)
                    } else {
                      setConfirmId(book.id)
                    }
                  }}
                  aria-label={
                    confirming ? t('shelf.confirmDelete') : t('shelf.delete')
                  }
                  title={
                    confirming ? t('shelf.confirmDelete') : t('shelf.delete')
                  }
                >
                  {confirming ? (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  )}
                </button>
              </div>
            )
          })}

          <button
            type="button"
            className="book book-add"
            onClick={addBook}
            aria-label={t('shelf.addBook')}
            title={t('shelf.addBook')}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {active && (
        <ShelfDialog
          book={active}
          onClose={() => setActive(null)}
          onRename={(name) => {
            setBooks((bs) =>
              bs.map((x) => (x.id === active.id ? { ...x, name } : x)),
            )
            setActive((a) => (a ? { ...a, name } : a))
          }}
        />
      )}
    </div>
  )
}
