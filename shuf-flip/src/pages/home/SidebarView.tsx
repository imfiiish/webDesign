import { useState } from 'react'
import type { ComponentType } from 'react'
import { COMPONENTS, PAGES, type CatalogEntry } from '../../catalog'
import { useI18n } from '../../i18n'
import Login from '../login'
import Shelf from '../shelf'
import Flip from '../flip'
import Rating from '../rating'
import FlipCardDemo from './FlipCardDemo'
import FontsView from './FontsView'

const ALL: CatalogEntry[] = [...PAGES, ...COMPONENTS]

// Implemented entries render live in the panel.
const PAGE_VIEWS: Record<string, ComponentType> = {
  login: Login,
  shelf: Shelf,
  flip: Flip,
  rating: Rating,
}
const COMPONENT_VIEWS: Record<string, ComponentType> = {
  'flip-card': FlipCardDemo,
  fonts: FontsView,
}

/** Sidebar presentation: fixed nav (Pages / Components) + panel. */
export default function SidebarView() {
  const { lang, t } = useI18n()
  const [activeId, setActiveId] = useState<string>(ALL[0]?.id ?? '')
  const active = ALL.find((e) => e.id === activeId)
  const View = active
    ? (PAGE_VIEWS[active.id] ?? COMPONENT_VIEWS[active.id])
    : undefined
  const kindOf = (e: CatalogEntry) =>
    PAGES.includes(e) ? t('kind.page') : t('kind.component')

  const item = (e: CatalogEntry) => (
    <button
      key={e.id}
      type="button"
      className={`navitem${e.id === activeId ? ' on' : ''}`}
      onClick={() => setActiveId(e.id)}
    >
      <span className="dot" />
      {e.title}
    </button>
  )

  return (
    <div className="shell">
      <aside className="side">
        <h2>{t('group.pages')}</h2>
        {PAGES.map(item)}
        <h2>{t('group.components')}</h2>
        {COMPONENTS.map(item)}
      </aside>
      <section className={`panel${View ? ' panel-preview' : ''}`}>
        {View ? (
          <View />
        ) : active ? (
          <div className="panel-inner">
            <div className="kind">{kindOf(active)}</div>
            <h1>{active.title}</h1>
            <p>{active.description[lang]}</p>
            <div className="panel-stage">{t('panel.preview')}</div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
