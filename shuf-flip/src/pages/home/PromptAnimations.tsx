import { SENTENCES } from './sentenceData'
import './promptAnimations.css'

type Variant = { id: string; label: string }

/** Each entry is the same English prompt card with a different hover/press
 *  feel, so one can be picked for the Sentence board. */
const VARIANTS: Variant[] = [
  { id: 'pa-shadow', label: 'Shadow' },
  { id: 'pa-lift', label: 'Lift' },
  { id: 'pa-zoom', label: 'Zoom' },
  { id: 'pa-liftzoom', label: 'Lift + zoom' },
  { id: 'pa-tilt', label: 'Tilt' },
  { id: 'pa-sheen', label: 'Sheen' },
  { id: 'pa-glow', label: 'Glow' },
  { id: 'pa-spring', label: 'Spring' },
]

/** Creative › SentenceCard:animations — hover or press a card to preview the
 *  motion; all eight show the same sentence. */
export default function PromptAnimations() {
  const words = SENTENCES[0].translation.match(/\S+/g) ?? []

  return (
    <div className="pa">
      <div className="pa-grid">
        {VARIANTS.map((v) => (
          <figure className="pa-item" key={v.id}>
            <div className={`pa-card ${v.id}`} role="button" tabIndex={0}>
              <span className="pa-tag">Prompt</span>
              <p className="pa-text">
                {words.map((w, i) => (
                  <span className="pa-word" key={i}>
                    {w}
                  </span>
                ))}
              </p>
            </div>
            <figcaption className="pa-label">{v.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
