import { useState } from 'react'
import LangToggle from '../../components/LangToggle'
import { useI18n } from '../../i18n'
import OverviewView from './OverviewView'
import PageView from './PageView'
import ComponentsView from './ComponentsView'
import DesignView from './DesignView'
import CreativeView from './CreativeView'
import './home.css'

type Mode = 'overview' | 'page' | 'components' | 'design' | 'creative'

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
          className={mode === 'page' ? 'on' : undefined}
          onClick={() => setMode('page')}
        >
          {t('mode.page')}
        </button>
        <button
          type="button"
          className={mode === 'components' ? 'on' : undefined}
          onClick={() => setMode('components')}
        >
          {t('mode.components')}
        </button>
        <button
          type="button"
          className={mode === 'design' ? 'on' : undefined}
          onClick={() => setMode('design')}
        >
          {t('mode.design')}
        </button>
        <button
          type="button"
          className={mode === 'creative' ? 'on' : undefined}
          onClick={() => setMode('creative')}
        >
          {t('mode.creative')}
        </button>
      </nav>
      <div className="app-body">
        {mode === 'overview' ? (
          <OverviewView />
        ) : mode === 'page' ? (
          <PageView />
        ) : mode === 'components' ? (
          <ComponentsView />
        ) : mode === 'design' ? (
          <DesignView />
        ) : (
          <CreativeView />
        )}
      </div>
    </div>
  )
}
