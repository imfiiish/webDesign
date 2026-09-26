import { useState } from 'react'
import ThemeToggle from '../../components/ThemeToggle'
import OverviewView from './OverviewView'
import SidebarView from './SidebarView'
import './home.css'

type Mode = 'overview' | 'sidebar'

/** The app home ("/"). Two bars on top; the mode bar picks the presentation.
 *  Overview is the default. */
export default function Home() {
  const [mode, setMode] = useState<Mode>('overview')

  return (
    <div className="app">
      <header className="bar">
        <span className="brand">
          shuf-flip <em>· design</em>
        </span>
        <ThemeToggle />
      </header>
      <nav className="modebar">
        <button
          type="button"
          className={mode === 'overview' ? 'on' : undefined}
          onClick={() => setMode('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={mode === 'sidebar' ? 'on' : undefined}
          onClick={() => setMode('sidebar')}
        >
          Sidebar
        </button>
      </nav>
      <div className="app-body">
        {mode === 'overview' ? <OverviewView /> : <SidebarView />}
      </div>
    </div>
  )
}
