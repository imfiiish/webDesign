import type { ComponentType } from 'react'
import SceneFlip from './SceneFlip'
import SceneFlipResults from './SceneFlipResults'
import SceneNav from './SceneNav'

/** Scene id -> live component. Shared by the Scenes panel and the /scene route. */
export const SCENE_VIEWS: Record<string, ComponentType<{ variant?: string }>> = {
  flip: SceneFlip,
  'flip-results': SceneFlipResults,
  nav: SceneNav,
}
