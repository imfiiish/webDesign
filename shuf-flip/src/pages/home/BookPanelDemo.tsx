import { useState } from 'react'
import BookPanel from '../shelf/BookPanel'
import { BOOKS, type Book } from '../shelf/data'

/** Isolated preview of the book detail panel, kept open (no modal, no close). */
export default function BookPanelDemo() {
  const [book, setBook] = useState<Book>(BOOKS[0])

  return (
    <div className="book-demo">
      <div className="modal book-modal">
        <BookPanel
          book={book}
          onRename={(name) => setBook((b) => ({ ...b, name }))}
          onStart={() => {}}
        />
      </div>
    </div>
  )
}
