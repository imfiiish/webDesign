// Single source of truth for the design catalog.
// The catalog shell (App.tsx) renders this list; entries are filled in
// milestone by milestone. Appearance only — no business logic.

export type EntryKind = 'page' | 'component'
export type EntryStatus = 'ready' | 'planned'

export type CatalogEntry = {
  /** Stable id, also used in the hash route (#/e/<id>). */
  id: string
  kind: EntryKind
  title: string
  description: string
  status: EntryStatus
}

export const PAGES: CatalogEntry[] = [
  {
    id: 'login',
    kind: 'page',
    title: 'Login',
    description: 'Step-wise entry: username expands, password dots, guest link.',
    status: 'planned',
  },
  {
    id: 'shelf',
    kind: 'page',
    title: 'Shelf',
    description: 'Book-spine shelf with progress, hover and delete confirm.',
    status: 'planned',
  },
  {
    id: 'flip',
    kind: 'page',
    title: 'Flip',
    description: 'Card ring: reveal definition, wheel / key flip, next round.',
    status: 'planned',
  },
  {
    id: 'rating',
    kind: 'page',
    title: 'Rating',
    description: 'Self-test: 1 / 2 / 3 rating bar with undo and skip confirm.',
    status: 'planned',
  },
]

export const COMPONENTS: CatalogEntry[] = [
  { id: 'flip-deck', kind: 'component', title: 'FlipDeck', description: 'Ring stage: layout, scale, hover glow, flip.', status: 'planned' },
  { id: 'flip-card', kind: 'component', title: 'FlipCard', description: 'Two-sided card with front / back faces.', status: 'planned' },
  { id: 'progress-dots', kind: 'component', title: 'ProgressDots', description: 'Three reveal-count dots, green → yellow → red.', status: 'planned' },
  { id: 'hint-bar', kind: 'component', title: 'HintBar', description: 'Bottom key hints, fixed and stage-aligned.', status: 'planned' },
  { id: 'rating-bar', kind: 'component', title: 'RatingBar', description: 'Familiar / unsure / unfamiliar buttons.', status: 'planned' },
  { id: 'shelf-item', kind: 'component', title: 'ShelfItem', description: 'Book cover with spine fill and page-edge lines.', status: 'planned' },
  { id: 'shelf-dialog', kind: 'component', title: 'ShelfDialog', description: 'Book detail: word list and side actions.', status: 'planned' },
  { id: 'tag-picker', kind: 'component', title: 'TagPicker', description: 'Include / exclude tag chips with live count.', status: 'planned' },
  { id: 'shortcut-help', kind: 'component', title: 'ShortcutHelp', description: 'Mouse / keyboard / trackpad reference modal.', status: 'planned' },
  { id: 'settings-dialog', kind: 'component', title: 'SettingsDialog', description: 'Segmented control in a modal.', status: 'planned' },
  { id: 'modal', kind: 'component', title: 'Modal', description: 'Backdrop, close button, Esc to dismiss.', status: 'planned' },
  { id: 'icon-button', kind: 'component', title: 'IconButton', description: 'Round icon button and its corner placements.', status: 'planned' },
  { id: 'theme-toggle', kind: 'component', title: 'ThemeToggle', description: 'Auto / light / dark cycle button.', status: 'planned' },
  { id: 'back-button', kind: 'component', title: 'BackButton', description: 'Top-left icon button.', status: 'planned' },
  { id: 'icons', kind: 'component', title: 'Icons', description: 'Inline SVG icon set.', status: 'planned' },
]

export const ALL_ENTRIES: CatalogEntry[] = [...PAGES, ...COMPONENTS]

export function findEntry(id: string): CatalogEntry | undefined {
  return ALL_ENTRIES.find((e) => e.id === id)
}
