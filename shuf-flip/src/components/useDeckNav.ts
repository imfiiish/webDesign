import { useEffect } from 'react'

/** Wheel navigation: coalesce deltas and step once per gesture. */
export function useWheelNav(step: (dir: 1 | -1) => void): void {
  useEffect(() => {
    let acc = 0
    let last = 0
    let idle: ReturnType<typeof setTimeout> | undefined
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return
      e.preventDefault()
      const unit =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
      const raw = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      acc += raw * unit
      clearTimeout(idle)
      idle = setTimeout(() => {
        acc = 0
      }, 150)
      if (Math.abs(acc) < 24) return
      const now = performance.now()
      if (now - last < 120) return
      const dir = acc > 0 ? 1 : -1
      acc = 0
      last = now
      step(dir)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      clearTimeout(idle)
      window.removeEventListener('wheel', onWheel)
    }
  }, [step])
}

/** Two quick right-clicks trigger an action. */
export function useDoubleRightClick(onDouble: () => void): void {
  useEffect(() => {
    let last = 0
    const onCtx = (e: MouseEvent) => {
      e.preventDefault()
      const now = performance.now()
      if (last !== 0 && now - last <= 400) {
        last = 0
        onDouble()
      } else {
        last = now
      }
    }
    window.addEventListener('contextmenu', onCtx)
    return () => window.removeEventListener('contextmenu', onCtx)
  }, [onDouble])
}
