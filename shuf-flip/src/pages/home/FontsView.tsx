import { useState } from 'react'
import { COMPONENTS, PAGES, type CatalogEntry } from '../../catalog'

const ALL: CatalogEntry[] = [...PAGES, ...COMPONENTS]

const kindOf = (e: CatalogEntry) => (PAGES.includes(e) ? 'Page' : 'Component')

/** Fonts specimen: big-type index with a sticky detail panel (former
 *  Editorial). Also handy for comparing typefaces. */
export default function FontsView() {
  const [activeId, setActiveId] = useState(ALL[0]?.id ?? '')
  const active = ALL.find((e) => e.id === activeId) ?? ALL[0]

  return (
    <main className="ed">
      <div className="ed-list">
        {ALL.map((e, i) => (
          <div
            key={e.id}
            className={`ed-row${e.id === activeId ? ' on' : ''}`}
            onMouseEnter={() => setActiveId(e.id)}
            onClick={() => setActiveId(e.id)}
          >
            <span className="num">{String(i + 1).padStart(2, '0')}</span>
            <span className="name">{e.title}</span>
            <span className="tag kind">{kindOf(e)}</span>
          </div>
        ))}
      </div>
      <aside className="ed-aside">
        <div className="kind">{kindOf(active)}</div>
        <h2>{active.title}</h2>
        <p>{active.description}</p>
      </aside>
    </main>
  )
}
