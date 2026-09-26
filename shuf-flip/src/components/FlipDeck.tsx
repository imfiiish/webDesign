import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import './deck.css'

export type CardSense = { pos?: string; defs: string[] }

export type CardData = {
  word: string
  phonetic: string
  senses: CardSense[]
  tags: string[]
}

/** Dot colors: r red / y yellow / g green / empty grey. */
type DotColor = 'r' | 'y' | 'g' | 'empty'

// Reveal count -> three dots:
//   1-3: one/two/three green; 4-6: yellow; 7-9: red; stops at three red.
const DOT_TIERS: DotColor[] = ['g', 'y', 'r']
function dotColors(n: number): DotColor[] {
  if (n <= 0) return ['empty', 'empty', 'empty']
  const tier = Math.min(Math.floor((n - 1) / 3), DOT_TIERS.length - 1)
  const filled = n >= 9 ? 3 : ((n - 1) % 3) + 1
  return Array.from({ length: 3 }, (_, i) =>
    i < filled ? DOT_TIERS[tier] : 'empty',
  )
}

// Visible window: ±1 visible, ±2 off-stage, beyond that parked hidden.
const SIDE = 2

/** Card slot: a ring position, 'B' the hidden back for even counts, 'S' the
 *  right slot when only two cards remain. */
export type Slot = number | 'B' | 'S'

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
            <Card
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

type CardProps = {
  word: CardData
  slot: Slot
  revealed?: boolean
  hovered?: boolean
  dots?: number
  notice?: string | null
  onClick?: () => void
  onContextMenu?: () => void
}

function Card({
  word,
  slot,
  revealed = false,
  hovered = false,
  dots = 0,
  notice = null,
  onClick,
  onContextMenu,
}: CardProps) {
  const isCenter = slot === 0
  const off = typeof slot === 'number' && Math.abs(slot) > SIDE
  const posClass = off
    ? slot > 0
      ? 'pos-off-r'
      : 'pos-off-l'
    : `pos-${slot}`

  const showNotice = isCenter && notice
  const wordLine = (
    <div className={`word${showNotice ? ' copying' : ''}`}>
      <span className="word-text">{word.word}</span>
      {showNotice && <span className="copy-notice">{notice}</span>}
    </div>
  )

  return (
    <div
      className={`card ${posClass}${isCenter ? ' active' : ''}${
        hovered ? ' hovered' : ''
      }`}
      data-word={word.word}
      onClick={onClick}
      onContextMenu={
        onContextMenu
          ? (e) => {
              e.preventDefault()
              onContextMenu()
            }
          : undefined
      }
    >
      <div className={`card-flip${isCenter && revealed ? ' flipped' : ''}`}>
        <div className="face front">
          <div className="inner">{wordLine}</div>
        </div>

        <div className="face back">
          {isCenter && revealed && dots > 0 && (
            <div className="dots">
              {dotColors(dots).map((c, i) => (
                <span key={i} className={`dot ${c}`} />
              ))}
            </div>
          )}
          <div className="inner">
            {wordLine}
            {isCenter && revealed && (
              <div className="detail">
                <div className="phonetic">{word.phonetic}</div>
                <div className="definition">
                  {word.senses.map((s, i) => (
                    <div className="sense" key={i}>
                      {s.pos && <span className="sense-pos">{s.pos}</span>}
                      <span className="sense-defs">{s.defs.join('；')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isCenter && revealed && word.tags.length > 0 && (
            <div className="tag-list">
              {word.tags.map((label) => (
                <span className="tag" key={label}>
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
