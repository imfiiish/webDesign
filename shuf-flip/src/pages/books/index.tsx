import { useSearchParams } from 'react-router-dom'
import BooksDefault from './BooksDefault'
import BooksOpen from './BooksOpen'
import BooksIndex from './BooksIndex'

/** The Wordbooks picker. Three takes live side by side:
 *  `default` — rail of covers over one slot; `open` — an open book on a desk;
 *  `index` — a flat data sheet over a two-column list index.
 *  The panel passes the variant; the route carries it in ?variant=. */
export default function Books({ variant }: { variant?: string }) {
  const [params] = useSearchParams()
  const shown = variant ?? params.get('variant') ?? 'default'

  if (shown === 'open') return <BooksOpen />
  if (shown === 'index') return <BooksIndex />
  return <BooksDefault />
}
