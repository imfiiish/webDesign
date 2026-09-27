import { useState } from 'react'
import type { ComponentType } from 'react'
import { COMPONENTS } from '../../catalog'
import HomeShell from './HomeShell'
import { useI18n } from '../../i18n'
import FlipCardDemo from './FlipCardDemo'
import FontsView from './FontsView'

// Implemented components render live in the panel.
const COMPONENT_VIEWS: Record<string, ComponentType> = {
  'flip-card': FlipCardDemo,
  fonts: FontsView,
}

/** Components presentation: a flat list of previews (no categories yet). */
export default function ComponentsView() {
  const { lang, t } = useI18n()
  const [activeId, setActiveId] = useState<string>(COMPONENTS[0]?.id ?? '')
  const active = COMPONENTS.find((c) => c.id === activeId)
  const View = active ? COMPONENT_VIEWS[active.id] : undefined

  const sidebar = (
    <>
      {COMPONENTS.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`navitem${c.id === activeId ? ' on' : ''}`}
          onClick={() => setActiveId(c.id)}
        >
          <span className="dot" />
          {c.title}
        </button>
      ))}
    </>
  )

  return (
    <HomeShell panelClassName={View ? 'panel-preview' : ''} sidebar={sidebar}>
      {View ? (
        <View />
      ) : active ? (
        <div className="panel-inner">
          <div className="kind">{t('kind.component')}</div>
          <h1>{active.title}</h1>
          <p>{active.description[lang]}</p>
          <div className="panel-stage">{t('panel.preview')}</div>
        </div>
      ) : null}
    </HomeShell>
  )
}
