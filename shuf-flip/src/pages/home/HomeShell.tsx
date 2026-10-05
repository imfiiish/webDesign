import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n'

type Props = {
  /** Left column content (nav / groups). */
  sidebar?: ReactNode
  /** Extra class for the right panel (e.g. "panel-preview"). */
  panelClassName?: string
  /** When set, show an "open full page" link in the panel's top-right. */
  openHref?: string
  /** Right panel content. */
  children?: ReactNode
}

/** Left-right split shared by the Page and Design presentations. */
export default function HomeShell({
  sidebar,
  panelClassName = '',
  openHref,
  children,
}: Props) {
  const { t } = useI18n()
  const location = useLocation()

  return (
    <div className="shell">
      <aside className="side">{sidebar}</aside>
      <section className={`panel${panelClassName ? ` ${panelClassName}` : ''}`}>
        {openHref && (
          <Link
            className="icon-btn panel-open"
            to={openHref}
            state={{ from: location.pathname + location.search }}
            aria-label={t('common.open')}
            title={t('common.open')}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="8 7 17 7 17 16" />
            </svg>
          </Link>
        )}
        {children}
      </section>
    </div>
  )
}
