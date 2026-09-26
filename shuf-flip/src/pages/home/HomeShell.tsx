import type { CSSProperties, ReactNode } from 'react'

type Props = {
  /** Left column content (nav / groups). */
  sidebar?: ReactNode
  /** Extra class for the right panel (e.g. "panel-preview"). */
  panelClassName?: string
  /** Inline style for the right panel (e.g. an inverted background). */
  panelStyle?: CSSProperties
  /** Right panel content. */
  children?: ReactNode
}

/** Left-right split shared by the Browse and Design presentations. */
export default function HomeShell({
  sidebar,
  panelClassName = '',
  panelStyle,
  children,
}: Props) {
  return (
    <div className="shell">
      <aside className="side">{sidebar}</aside>
      <section
        className={`panel${panelClassName ? ` ${panelClassName}` : ''}`}
        style={panelStyle}
      >
        {children}
      </section>
    </div>
  )
}
