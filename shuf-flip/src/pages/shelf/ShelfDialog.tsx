import { useState } from 'react'
import Modal from '../../components/Modal'
import BookPanel from './BookPanel'
import type { Book } from './data'

type Props = {
  book: Book
  onClose: () => void
  onRename: (name: string) => void
}

/** Book detail in a modal; the panel itself lives in BookPanel. */
export default function ShelfDialog({ book, onClose, onRename }: Props) {
  // the panel owns the title-edit state; the modal just wants to know it
  const [editing, setEditing] = useState(false)

  return (
    <Modal
      onClose={onClose}
      ariaLabel={book.name}
      className="book-modal"
      closeOnEscape={!editing}
    >
      <BookPanel
        book={book}
        onRename={onRename}
        onStart={onClose}
        onEditingChange={setEditing}
      />
    </Modal>
  )
}
