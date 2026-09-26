import { useEffect, useRef, useState } from 'react'
import Modal from '../../components/Modal'
import { useI18n } from '../../i18n'
import { WORDS } from '../flip/data'
import type { Book } from './data'

type Props = {
  book: Book
  onClose: () => void
  onRename: (name: string) => void
}

/** Book detail: rename title, this-round word list, start action. */
export default function ShelfDialog({ book, onClose, onRename }: Props) {
  const { t } = useI18n()

  // title rename: click to edit, Enter / blur to commit, Esc to cancel
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(book.name)

  const commitRename = () => {
    const name = draft.trim()
    if (name && name !== book.name) onRename(name)
    else setDraft(book.name)
    setEditing(false)
  }

  const cancelRename = () => {
    setDraft(book.name)
    setEditing(false)
  }

  // click a word -> copy, show "Copied" for a moment
  const [copied, setCopied] = useState<string | null>(null)
  const copyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  const copy = (word: string) => {
    void navigator.clipboard?.writeText(word).then(
      () => {
        setCopied(word)
        window.clearTimeout(copyTimer.current)
        copyTimer.current = window.setTimeout(() => setCopied(null), 1100)
      },
      () => {},
    )
  }

  const words = WORDS.slice(0, 10)

  return (
    <Modal
      onClose={onClose}
      ariaLabel={book.name}
      className="book-modal"
      closeOnEscape={!editing}
    >
      <div className="modal-title-bar">
        {editing ? (
          <input
            className="modal-title-input"
            value={draft}
            autoFocus
            maxLength={24}
            aria-label={t('shelf.nameAria')}
            placeholder={t('shelf.namePlaceholder')}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitRename()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                cancelRename()
              }
            }}
            onBlur={commitRename}
          />
        ) : (
          <button
            type="button"
            className="modal-title modal-title-edit"
            onClick={() => {
              setDraft(book.name)
              setEditing(true)
            }}
            aria-label={t('shelf.nameEditTitle')}
            title={t('shelf.nameEditTitle')}
          >
            <span className="title-text">{book.name}</span>
            <svg
              className="edit-icon"
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          </button>
        )}
      </div>

      <div className="book-body">
        <div className="book-list-head">{t('shelf.thisRound')}</div>

        <div className="book-list">
          {words.map((w) => (
            <button
              type="button"
              className="word-row"
              key={w.word}
              onClick={() => copy(w.word)}
              title={t('shelf.copyPlay')}
            >
              <span className="word-text">{w.word}</span>
              {copied === w.word && (
                <span className="copied-tag">{t('common.copied')}</span>
              )}
            </button>
          ))}
        </div>

        <aside className="book-side">
          <div className="side-group">
            <button
              type="button"
              className="btn btn-primary side-btn"
              onClick={onClose}
            >
              {t('shelf.start')}
            </button>
          </div>
        </aside>
      </div>
    </Modal>
  )
}
