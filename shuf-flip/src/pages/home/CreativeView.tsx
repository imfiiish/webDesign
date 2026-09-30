import { useState } from 'react'
import HomeShell from './HomeShell'
import { useI18n } from '../../i18n'
import FlipAnimations from './FlipAnimations'
import SentenceFill from './SentenceFill'

type Item = 'flip' | 'sentence'

/** Creative presentation: same split as Page. Animations holds a live flip
 *  demo, Sentence a pinyin fill-in demo. */
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
        </>
      }
    >
      {active === 'flip' ? <FlipAnimations /> : <SentenceFill />}
    </HomeShell>
  )
}
