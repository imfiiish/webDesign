import { useState } from 'react'
import HomeShell from './HomeShell'
import { useI18n } from '../../i18n'
import FlipAnimations from './FlipAnimations'

type Item = 'flip'

/** Creative presentation: same split as Browse. Animations holds a live flip
 *  demo; Styles is deliberately empty for now. */
export default function CreativeView() {
  const { t } = useI18n()
  const [active, setActive] = useState<Item>('flip')

  return (
    <HomeShell
      panelClassName="panel-top"
      sidebar={
        <>
          <h2>{t('design.animations')}</h2>
          <button
            type="button"
            className={`navitem${active === 'flip' ? ' on' : ''}`}
            onClick={() => setActive('flip')}
          >
            <span className="dot" />
            {t('anim.flip')}
          </button>
          <h2>{t('design.styles')}</h2>
        </>
      }
    >
      {active === 'flip' ? <FlipAnimations /> : null}
    </HomeShell>
  )
}
