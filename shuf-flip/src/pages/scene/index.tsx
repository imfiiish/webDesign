import { Navigate, useParams } from 'react-router-dom'
import { SCENE_VIEWS } from '../home/sceneViews'

/** Standalone scene route (/scene/:id) — the Scenes panel's "open" target. */
export default function Scene() {
  const { id } = useParams()
  const View = id ? SCENE_VIEWS[id] : undefined
  return View ? <View /> : <Navigate to="/" replace />
}
