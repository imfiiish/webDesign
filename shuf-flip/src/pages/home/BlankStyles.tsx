import './blankStyles.css'

type Variant = { id: string; label: string }

/** Each entry shows the same three blank states — empty, active, filled — in a
 *  different material, so one can be picked for the Sentence board. */
const VARIANTS: Variant[] = [
  { id: 'bl-underline', label: 'Underline' },
  { id: 'bl-inset', label: 'Inset well' },
  { id: 'bl-box', label: 'Box' },
  { id: 'bl-dashed', label: 'Dashed' },
  { id: 'bl-pill', label: 'Pill' },
  { id: 'bl-soft', label: 'Soft card' },
  { id: 'bl-notebook', label: 'Notebook' },
  { id: 'bl-minimal', label: 'Minimal' },
  { id: 'bl-well-deep', label: 'Deep well' },
  { id: 'bl-well-soft', label: 'Soft well' },
  { id: 'bl-well-neu', label: 'Neumorphic well' },
  { id: 'bl-well-rim', label: 'Rim well' },
  { id: 'bl-well-glow', label: 'Glow well' },
  { id: 'bl-well-pill', label: 'Pill well' },
  { id: 'bl-wellraised', label: 'Well + raised' },
  { id: 'bl-wellraised-deep', label: 'Deep well + raised' },
  { id: 'bl-wellraised-soft', label: 'Soft well + raised' },
  { id: 'bl-wellraised-tint', label: 'Well + tinted fill' },
  { id: 'bl-wellraised-border', label: 'Well + outlined fill' },
  { id: 'bl-wellraised-pill', label: 'Pill well + raised' },
]

/** Creative › SentenceBlanks:styles — the blanks in eight materials. */
export default function BlankStyles() {
  return (
    <div className="bl">
      <div className="bl-grid">
        {VARIANTS.map((v) => (
          <figure className="bl-item" key={v.id}>
            <div className={`bl-row ${v.id}`}>
              <span className="bl-blank" />
              <span className="bl-blank bl-active">
                <span className="bl-caret" />
              </span>
              <span className="bl-filled">我</span>
            </div>
            <figcaption className="bl-label">{v.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
