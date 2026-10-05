import { useState } from 'react'
import HomeShell from './HomeShell'
import { useI18n } from '../../i18n'
import FlipAnimations from './FlipAnimations'
import SentenceBoard from './SentenceBoard'
import PromptAnimations from './PromptAnimations'
import BoxStyles from './BoxStyles'
import BlankStyles from './BlankStyles'
import ResultsIdeas from './ResultsIdeas'

type Item =
  | 'flip'
  | 'sentence'
  | 'cardAnimations'
  | 'boxStyles'
  | 'blankStyles'
  | 'resultsIdeas'

/** Creative presentation: a live flip demo, the sentence exercise, and three
 *  pickers for the sentence card's motion, tray and blanks. */
export default function CreativeView() {
  const { t } = useI18n()
  const [active, setActive] = useState<Item>('flip')

  return (
    <HomeShell
      panelClassName="panel-top"
      sidebar={
        <>
          <h2>{t('design.misc')}</h2>
          <button
            type="button"
            className={`navitem${active === 'flip' ? ' on' : ''}`}
            onClick={() => setActive('flip')}
          >
            <span className="dot" />
            {t('anim.flip')}
          </button>
          <button
            type="button"
            className={`navitem${active === 'sentence' ? ' on' : ''}`}
            onClick={() => setActive('sentence')}
          >
            <span className="dot" />
            {t('creative.sentence')}
          </button>
          <button
            type="button"
            className={`navitem${active === 'cardAnimations' ? ' on' : ''}`}
            onClick={() => setActive('cardAnimations')}
          >
            <span className="dot" />
            {t('anim.promptCard')}
          </button>
          <button
            type="button"
            className={`navitem${active === 'boxStyles' ? ' on' : ''}`}
            onClick={() => setActive('boxStyles')}
          >
            <span className="dot" />
            {t('anim.boxStyles')}
          </button>
          <button
            type="button"
            className={`navitem${active === 'blankStyles' ? ' on' : ''}`}
            onClick={() => setActive('blankStyles')}
          >
            <span className="dot" />
            {t('anim.blankStyles')}
          </button>
          <button
            type="button"
            className={`navitem${active === 'resultsIdeas' ? ' on' : ''}`}
            onClick={() => setActive('resultsIdeas')}
          >
            <span className="dot" />
            {t('results.ideas')}
          </button>
        </>
      }
    >
      {active === 'flip' ? (
        <FlipAnimations />
      ) : active === 'sentence' ? (
        <SentenceBoard />
      ) : active === 'cardAnimations' ? (
        <PromptAnimations />
      ) : active === 'boxStyles' ? (
        <BoxStyles />
      ) : active === 'blankStyles' ? (
        <BlankStyles />
      ) : (
        <ResultsIdeas />
      )}
    </HomeShell>
  )
}
