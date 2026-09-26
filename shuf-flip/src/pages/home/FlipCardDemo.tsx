import { useState } from 'react'
import FlipCard from '../../components/FlipCard'
import { WORDS } from '../flip/data'

/** Isolated preview of FlipCard. Click to flip; every reveal bumps the dots. */
export default function FlipCardDemo() {
  const [revealed, setRevealed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [count, setCount] = useState(0)

  const flip = () => {
    if (!revealed) setCount((c) => c + 1)
    setRevealed((v) => !v)
  }

  return (
    <div className="card-demo">
      <div
        className="card-demo-stage"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <FlipCard
          word={WORDS[0]}
          slot={0}
          revealed={revealed}
          hovered={hovered}
          dots={count}
          onClick={flip}
        />
      </div>
    </div>
  )
}
