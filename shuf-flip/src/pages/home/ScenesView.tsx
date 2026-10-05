import { Fragment, useState } from 'react'
import { SCENES } from '../../catalog'
import HomeShell from './HomeShell'
import { useI18n } from '../../i18n'
import { SCENE_VIEWS } from './sceneViews'
type Selection = { scene: string; variant: string }

/** Scenes presentation: assembled moments — a page plus extra state (a dialog,
 *  a completed round), more than a single page but not a whole flow. */
export default function ScenesView() {
  const { lang, t } = useI18n()
  const [active, setActive] = useState<Selection>({
    scene: SCENES[0]?.id ?? '',
    variant: SCENES[0]?.variants[0]?.id ?? '',
  })

  const scene = SCENES.find((s) => s.id === active.scene) ?? SCENES[0]
  const View = scene ? SCENE_VIEWS[scene.id] : undefined

  const sidebar = (
    <>
      {SCENES.map((s) => (
        <Fragment key={s.id}>
          <h2>{s.title}</h2>
          {s.variants.map((v) => {
            const on = s.id === active.scene && v.id === active.variant
            return (
              <button
                key={v.id}
                type="button"
                className={`navitem${on ? ' on' : ''}`}
                onClick={() => setActive({ scene: s.id, variant: v.id })}
              >
                <span className="dot" />
                {v.name[lang]}
              </button>
            )
          })}
        </Fragment>
      ))}
    </>
  )

  return (
    <HomeShell
      panelClassName={View ? 'panel-preview' : ''}
      openHref={View && scene ? `/scene/${scene.id}` : undefined}
      sidebar={sidebar}
    >
      {View ? (
        <View key={`${scene?.id}:${active.variant}`} variant={active.variant} />
      ) : scene ? (
        <div className="panel-inner">
          <div className="kind">{t('kind.scene')}</div>
          <h1>{scene.title}</h1>
          <p>{scene.description[lang]}</p>
          <div className="panel-stage">{t('panel.preview')}</div>
        </div>
      ) : null}
    </HomeShell>
  )
}
