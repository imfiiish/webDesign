import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { SCENE_VIEWS } from '../home/sceneViews'

/** Standalone scene route (/scene/:id) — the Scenes panel's "open" target.
 *  Reads an optional ?variant= so a specific design can be opened directly. */
export default function Scene() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const View = id ? SCENE_VIEWS[id] : undefined
  const variant = params.get('variant') ?? undefined
  return View ? <View variant={variant} /> : <Navigate to="/" replace />
}
