// Demo books for the shelf page. Appearance only — progress is hardcoded.

export type Book = {
  id: number
  name: string
  total: number
  met: number
  revealed: number
}

export const BOOKS: Book[] = [
  { id: 1, name: 'CET4', total: 120, met: 84, revealed: 40 },
  { id: 2, name: 'CET6', total: 300, met: 150, revealed: 72 },
  { id: 3, name: 'Oxford 5000', total: 220, met: 33, revealed: 12 },
]
