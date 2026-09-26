import { useState } from 'react'
import FlipCard from '../../components/FlipCard'
import { useI18n } from '../../i18n'
import { WORDS } from '../flip/data'

/** Isolated preview of FlipCard: the center card with reveal / dots controls. */
export default function FlipCardDemo() {
  const { t } = useI18n()
  const [revealed, setRevealed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [dots, setDots] = useState(3)

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
          dots={dots}
          onClick={() => setRevealed((v) => !v)}
        />
      </div>
      <div className="card-demo-bar">
        <button
          type="button"
          className={`btn btn-ghost${revealed ? ' on' : ''}`}
          onClick={() => setRevealed((v) => !v)}
        >
          {revealed ? t('card.hide') : t('card.reveal')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setDots((d) => (d + 1) % 11)}
        >
          {t('card.dots')}: {dots}
        </button>
      </div>
    </div>
  )
}
