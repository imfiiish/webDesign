import { useState } from 'react'
import HomeShell from './HomeShell'
import { useI18n } from '../../i18n'
import FlipAnimations from './FlipAnimations'
import SentenceBoard from './SentenceBoard'
import PromptAnimations from './PromptAnimations'

type Item = 'flip' | 'sentence' | 'cardAnimations'

/** Creative presentation: a live flip demo and the sentence exercise. */
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
        </>
      }
    >
      {active === 'flip' ? (
        <FlipAnimations />
      ) : active === 'sentence' ? (
        <SentenceBoard />
      ) : (
        <PromptAnimations />
      )}
    </HomeShell>
  )
}
