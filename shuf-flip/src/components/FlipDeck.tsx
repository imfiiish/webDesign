import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import FlipCard, { type CardData, type Slot } from './FlipCard'
import './deck.css'

export type { CardData, CardSense, Slot } from './FlipCard'

function slotOf(p: number, center: number, n: number): Slot {
  let d = (p - center) % n
  if (d < 0) d += n
  if (n === 2) return d === 0 ? 0 : 'S'
  if (n % 2 === 0 && d === n / 2) return 'B'
  if (d > n / 2) d -= n
  return d
}

type FlipDeckProps = {
  deck: CardData[]
  center: number
  revealed?: boolean
  centerNotice?: string | null
  revealCounts?: Record<string, number>
  scale: number
  stageKey?: number | string
  onCardClick?: (name: string, slot: Slot) => void
  onCardContextMenu?: () => void
}

/** Card ring: cards absolutely stacked at center, slid around via transform. */
export default function FlipDeck({
  deck,
  center,
  revealed = false,
  centerNotice = null,
  revealCounts = {},
  scale,
  stageKey,
  onCardClick,
  onCardContextMenu,
}: FlipDeckProps) {
  const TOTAL = deck.length

  // Hover glow follows the pointer position, not CSS :hover (so it does not
  // stick to a card that is moving).
  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const pointer = useRef<{ x: number; y: number } | null>(null)

  const updateHover = useCallback(() => {
    const pt = pointer.current
    if (!pt) return
    const el = document.elementFromPoint(pt.x, pt.y)
    const cardEl = el?.closest<HTMLElement>('.card[data-word]')
    setHoveredName(cardEl?.dataset.word ?? null)
  }, [])

  const onCardsMouseMove = useCallback(
    (e: ReactMouseEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY }
      updateHover()
    },
    [updateHover],
  )

  const onCardsMouseLeave = useCallback(() => {
    pointer.current = null
    setHoveredName(null)
  }, [])

  useEffect(() => {
    if (!pointer.current) return
    let raf = 0
    const start = performance.now()
    const tick = () => {
      updateHover()
      if (performance.now() - start < 520) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [center, deck, updateHover])

  return (
    <div
      className="stage"
      key={stageKey}
      style={{ '--stage-scale': scale } as CSSProperties}
    >
      <div
        className="cards"
        onMouseMove={onCardsMouseMove}
        onMouseLeave={onCardsMouseLeave}
      >
        {deck.map((word, p) => {
          const slot = slotOf(p, center, TOTAL)
          return (
            <FlipCard
              key={word.word}
              word={word}
              slot={slot}
              revealed={slot === 0 && revealed}
              notice={slot === 0 ? centerNotice : null}
              hovered={hoveredName === word.word}
              dots={revealCounts[word.word] || 0}
              onClick={() => onCardClick?.(word.word, slot)}
              onContextMenu={
                slot === 0 && onCardContextMenu
                  ? () => onCardContextMenu()
                  : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}
