import { useSearchParams } from 'react-router-dom'
import LangToggle from '../../components/LangToggle'
import { useI18n } from '../../i18n'
import OverviewView from './OverviewView'
import ScenesView from './ScenesView'
import PageView from './PageView'
import ComponentsView from './ComponentsView'
import DesignView from './DesignView'
import CreativeView from './CreativeView'
import './home.css'

type Mode = 'overview' | 'scenes' | 'page' | 'components' | 'design' | 'creative'

const MODES: Mode[] = [
  'overview',
  'scenes',
  'page',
  'components',
  'design',
  'creative',
]

/** The app home ("/"). Two bars on top; the mode bar picks the presentation.
 *  Overview is the default. The active mode lives in `?view=` so that opening
 *  a page and coming back lands on the same bar. */
export default function Home() {
  const { t } = useI18n()
  const [params, setParams] = useSearchParams()
  const raw = params.get('view')
  const mode: Mode = MODES.includes(raw as Mode) ? (raw as Mode) : 'overview'

  const setMode = (next: Mode) =>
    setParams(next === 'overview' ? {} : { view: next }, { replace: true })

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
          className={mode === 'scenes' ? 'on' : undefined}
          onClick={() => setMode('scenes')}
        >
          {t('mode.scenes')}
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
        ) : mode === 'scenes' ? (
          <ScenesView />
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
