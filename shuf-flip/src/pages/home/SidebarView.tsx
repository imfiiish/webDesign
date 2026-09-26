import { useState } from 'react'
import { COMPONENTS, PAGES, type CatalogEntry } from '../../catalog'
import FontsView from './FontsView'

const ALL: CatalogEntry[] = [...PAGES, ...COMPONENTS]

const kindOf = (e: CatalogEntry) => (PAGES.includes(e) ? 'Page' : 'Component')

/** Sidebar presentation: fixed nav (Pages / Components / Fonts) + panel. */
export default function SidebarView() {
  const [activeId, setActiveId] = useState<string>(ALL[0]?.id ?? '')
  const active = ALL.find((e) => e.id === activeId)

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
        <h2>Pages</h2>
        {PAGES.map(item)}
        <h2>Components</h2>
        {COMPONENTS.map(item)}
        <h2>Fonts</h2>
        <button
          type="button"
          className={`navitem${activeId === 'fonts' ? ' on' : ''}`}
          onClick={() => setActiveId('fonts')}
        >
          <span className="dot" />
          Type specimen
        </button>
      </aside>
      <section className={`panel${activeId === 'fonts' ? ' panel-fonts' : ''}`}>
        {activeId === 'fonts' || !active ? (
          <FontsView />
        ) : (
          <div className="panel-inner">
            <div className="kind">{kindOf(active)}</div>
            <h1>{active.title}</h1>
            <p>{active.description}</p>
            <div className="stage">preview area</div>
          </div>
        )}
      </section>
    </div>
  )
}
