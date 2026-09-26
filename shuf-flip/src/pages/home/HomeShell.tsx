import type { ReactNode } from 'react'

type Props = {
  /** Left column content (nav / groups). */
  sidebar?: ReactNode
  /** Extra class for the right panel (e.g. "panel-preview"). */
  panelClassName?: string
  /** Right panel content. */
  children?: ReactNode
}

/** Left-right split shared by the Browse and Design presentations. */
export default function HomeShell({
  sidebar,
  panelClassName = '',
  children,
}: Props) {
  return (
    <div className="shell">
      <aside className="side">{sidebar}</aside>
      <section className={`panel${panelClassName ? ` ${panelClassName}` : ''}`}>
        {children}
      </section>
    </div>
  )
}
