import { useState } from 'react'
import type { ComponentType } from 'react'
import { COMPONENTS, PAGES, type CatalogEntry } from '../../catalog'
import { useI18n } from '../../i18n'
import Login from '../login'
import Flip from '../flip'
import FontsView from './FontsView'

const ALL: CatalogEntry[] = [...PAGES, ...COMPONENTS]

// Pages that are implemented render live in the panel.
const PAGE_VIEWS: Record<string, ComponentType> = {
  login: Login,
  flip: Flip,
}

/** Sidebar presentation: fixed nav (Pages / Components / Fonts) + panel.
 *  Clicking an implemented page shows its live preview on the right. */
export default function SidebarView() {
  const { lang, t } = useI18n()
  const [activeId, setActiveId] = useState<string>(ALL[0]?.id ?? '')
  const active = ALL.find((e) => e.id === activeId)
  const PageView = active ? PAGE_VIEWS[active.id] : undefined
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

  const panelClass =
    activeId === 'fonts' ? ' panel-fonts' : PageView ? ' panel-preview' : ''

  return (
    <div className="shell">
      <aside className="side">
        <h2>{t('group.pages')}</h2>
        {PAGES.map(item)}
        <h2>{t('group.components')}</h2>
        {COMPONENTS.map(item)}
        <h2>{t('group.fonts')}</h2>
        <button
          type="button"
          className={`navitem${activeId === 'fonts' ? ' on' : ''}`}
          onClick={() => setActiveId('fonts')}
        >
          <span className="dot" />
          {t('nav.specimen')}
        </button>
      </aside>
      <section className={`panel${panelClass}`}>
        {activeId === 'fonts' ? (
          <FontsView />
        ) : PageView ? (
          <PageView />
        ) : active ? (
          <div className="panel-inner">
            <div className="kind">{kindOf(active)}</div>
            <h1>{active.title}</h1>
            <p>{active.description[lang]}</p>
            <div className="stage">{t('panel.preview')}</div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
