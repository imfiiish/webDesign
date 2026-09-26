import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

// Stage design size (basis for the equal-ratio scaling).
const STAGE_W = 1200
const STAGE_H = 360

/** Equal-ratio scaling: measure the stage area, fit 1200x360 into it. */
export function useStageScale(): {
  stageRef: RefObject<HTMLDivElement | null>
  scale: number
} {
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      setScale(Math.max(0.2, Math.min(1, r.width / STAGE_W, r.height / STAGE_H)))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return { stageRef, scale }
}
