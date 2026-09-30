import { useState } from 'react'
import { WORDS } from '../flip/data'
import './animations.css'

type Variant = { id: string; label: string }

/** Every variant renders the same word, so only the motion differs. */
const VARIANTS: Variant[] = [
  { id: 'flip-y', label: 'Flip Y' },
  { id: 'flip-x', label: 'Flip X' },
  { id: 'diagonal', label: 'Diagonal' },
  { id: 'lift', label: 'Flip + lift' },
  { id: 'spin', label: 'Spin' },
  { id: 'cube', label: 'Cube' },
  { id: 'spin-x', label: 'Spin X' },
  { id: 'snap', label: 'Snap' },
  { id: 'slow', label: 'Slow' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'zoom', label: 'Flip + zoom' },
  { id: 'swap', label: 'Flip + swap' },
  { id: 'cube-x', label: 'Cube X' },
]

/** Creative › Animations: the same two-sided card in several flip motions.
 *  Click any card to flip it. */
export default function FlipAnimations() {
  const word = WORDS[0]
  const definition = word.senses.map((s) => s.defs.join('；')).join('；')

  const [flipped, setFlipped] = useState(() => VARIANTS.map(() => false))

  const toggleAt = (i: number) =>
    setFlipped((f) => f.map((v, j) => (j === i ? !v : v)))

  return (
    <div className="fa">
      <div className="fa-grid">
        {VARIANTS.map((v, i) => (
          <figure className="fa-item" key={v.id}>
            <div
              className={`fa-card ${v.id}${flipped[i] ? ' flipped' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={flipped[i]}
              onClick={() => toggleAt(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleAt(i)
                }
              }}
            >
              <div className="fa-flip">
                <div className="fa-face fa-front">
                  <span className="fa-word">{word.word}</span>
                </div>
                <div className="fa-face fa-back">
                  <span className="fa-word">{word.word}</span>
                  <span className="fa-phon">{word.phonetic}</span>
                  <span className="fa-def">{definition}</span>
                </div>
              </div>
            </div>
            <figcaption className="fa-label">{v.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
