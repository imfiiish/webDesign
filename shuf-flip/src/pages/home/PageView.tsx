import { Fragment, useState } from 'react'
import type { ComponentType } from 'react'
import { PAGES } from '../../catalog'
import HomeShell from './HomeShell'
import { useI18n } from '../../i18n'
import Login from '../login'
import Shelf from '../shelf'
import Flip from '../flip'
import Rating from '../rating'

// Implemented pages render live in the panel.
const PAGE_VIEWS: Record<string, ComponentType> = {
  login: Login,
  shelf: Shelf,
  flip: Flip,
  rating: Rating,
}

type Selection = { page: string; variant: string }

/** Page presentation: one section per page, its variants (Default) below. */
export default function PageView() {
  const { lang, t } = useI18n()
  const [active, setActive] = useState<Selection>({
    page: PAGES[0]?.id ?? '',
    variant: PAGES[0]?.variants[0]?.id ?? '',
  })

  const page = PAGES.find((p) => p.id === active.page) ?? PAGES[0]
  const View = page ? PAGE_VIEWS[page.id] : undefined

  const sidebar = (
    <>
      {PAGES.map((p) => (
        <Fragment key={p.id}>
          <h2>{p.title}</h2>
          {p.variants.map((v) => {
            const on = p.id === active.page && v.id === active.variant
            return (
              <button
                key={v.id}
                type="button"
                className={`navitem${on ? ' on' : ''}`}
                onClick={() => setActive({ page: p.id, variant: v.id })}
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
        <View />
      ) : page ? (
        <div className="panel-inner">
          <div className="kind">{t('kind.page')}</div>
          <h1>{page.title}</h1>
          <p>{page.description[lang]}</p>
          <div className="panel-stage">{t('panel.preview')}</div>
        </div>
      ) : null}
    </HomeShell>
  )
}
