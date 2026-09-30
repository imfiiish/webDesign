import { Fragment, useState } from 'react'
import type { ComponentType } from 'react'
import { COMPONENTS } from '../../catalog'
import HomeShell from './HomeShell'
import { useI18n } from '../../i18n'
import FlipCardDemo from './FlipCardDemo'
import BookPanelDemo from './BookPanelDemo'

// Implemented components render live in the panel. All take an optional
// `variant` (currently only FlipCard uses it).
const COMPONENT_VIEWS: Record<string, ComponentType<{ variant?: string }>> = {
  'flip-card': FlipCardDemo,
  'book-panel': BookPanelDemo,
}

type Selection = { component: string; variant: string }

/** Components presentation: one section per component, its variants below. */
export default function ComponentsView() {
  const { lang, t } = useI18n()
  const [active, setActive] = useState<Selection>({
    component: COMPONENTS[0]?.id ?? '',
    variant: COMPONENTS[0]?.variants[0]?.id ?? '',
  })

  const comp = COMPONENTS.find((c) => c.id === active.component) ?? COMPONENTS[0]
  const View = comp ? COMPONENT_VIEWS[comp.id] : undefined

  const sidebar = (
    <>
      {COMPONENTS.map((c) => (
        <Fragment key={c.id}>
          <h2>{c.title}</h2>
          {c.variants.map((v) => {
            const on = c.id === active.component && v.id === active.variant
            return (
              <button
                key={v.id}
                type="button"
                className={`navitem${on ? ' on' : ''}`}
                onClick={() => setActive({ component: c.id, variant: v.id })}
              >
                <span className="dot" />
                {v.name[lang]}
              </button>
            )
          })}
        </Fragment>
      ))}
    </>
  )

  return (
    <HomeShell panelClassName={View ? 'panel-preview' : ''} sidebar={sidebar}>
      {View ? (
        <View key={`${comp?.id}:${active.variant}`} variant={active.variant} />
      ) : comp ? (
        <div className="panel-inner">
          <div className="kind">{t('kind.component')}</div>
          <h1>{comp.title}</h1>
          <p>{comp.description[lang]}</p>
          <div className="panel-stage">{t('panel.preview')}</div>
        </div>
      ) : null}
    </HomeShell>
  )
}
