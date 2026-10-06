import { Fragment, useState } from 'react'
import type { ComponentType } from 'react'
import { PAGES } from '../../catalog'
import HomeShell from './HomeShell'
import { useI18n } from '../../i18n'
import Login from '../login'
import Shelf from '../shelf'
import Books from '../books'
import Flip from '../flip'
import Rating from '../rating'
import Results from '../results'
import Progress from '../progress'
import Settings from '../settings'

// Implemented pages render live in the panel. All take an optional `variant`
// (currently only Flip uses it) — pages ignore it when they have no variants.
const PAGE_VIEWS: Record<string, ComponentType<{ variant?: string }>> = {
  login: Login,
  shelf: Shelf,
  books: Books,
  flip: Flip,
  rating: Rating,
  results: Results,
  progress: Progress,
  settings: Settings,
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
    <HomeShell
      panelClassName={View ? 'panel-preview' : ''}
      openHref={
        View && page
          ? `/${page.id}${
              active.variant !== 'default' ? `?variant=${active.variant}` : ''
            }`
          : undefined
      }
      sidebar={sidebar}
    >
      {View ? (
        <View key={`${page?.id}:${active.variant}`} variant={active.variant} />
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
