import { useState } from 'react'
import LangToggle from '../../components/LangToggle'
import ThemeToggle from '../../components/ThemeToggle'
import { useI18n } from '../../i18n'
import OverviewView from './OverviewView'
import SidebarView from './SidebarView'
import './home.css'

type Mode = 'overview' | 'sidebar'

/** The app home ("/"). Two bars on top; the mode bar picks the presentation.
 *  Overview is the default. */
export default function Home() {
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode>('overview')

  return (
    <div className="app">
      <header className="bar">
        <span className="brand">
          shuf-flip <em>· design</em>
        </span>
        <div className="bar-tools">
          <LangToggle />
          <ThemeToggle />
        </div>
      </header>
      <nav className="modebar">
        <button
          type="button"
          className={mode === 'overview' ? 'on' : undefined}
          onClick={() => setMode('overview')}
        >
          {t('mode.overview')}
        </button>
        <button
          type="button"
          className={mode === 'sidebar' ? 'on' : undefined}
          onClick={() => setMode('sidebar')}
        >
          {t('mode.sidebar')}
        </button>
      </nav>
      <div className="app-body">
        {mode === 'overview' ? <OverviewView /> : <SidebarView />}
      </div>
    </div>
  )
}
