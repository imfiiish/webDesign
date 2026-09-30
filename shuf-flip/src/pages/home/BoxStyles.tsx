import { SENTENCES } from './sentenceData'
import './boxStyles.css'

type Variant = { id: string; label: string }

/** Each entry is the same tray (word bank + blanks) in a different material,
 *  so one can be picked for the Sentence board. */
const VARIANTS: Variant[] = [
  { id: 'bx-recessed', label: 'Recessed' },
  { id: 'bx-raised', label: 'Raised' },
  { id: 'bx-outline', label: 'Outline' },
  { id: 'bx-flat', label: 'Flat' },
  { id: 'bx-soft', label: 'Soft' },
  { id: 'bx-insetborder', label: 'Inset + border' },
  { id: 'bx-glass', label: 'Glass' },
  { id: 'bx-dashed', label: 'Dashed' },
]

/** Creative › SentenceBox:styles — the same tray shown in eight materials. */
export default function BoxStyles() {
  const chips = SENTENCES[0].tokens.slice(0, 3)

  return (
    <div className="bx">
      <div className="bx-grid">
        {VARIANTS.map((v) => (
          <figure className="bx-item" key={v.id}>
            <div className={`bx-box ${v.id}`}>
              <div className="bx-rack">
                {chips.map((t) => (
                  <span className="bx-chip" key={t.text}>
                    <span className="bx-chip-text">{t.text}</span>
                    <span className="bx-chip-pinyin">{t.pinyin}</span>
                  </span>
                ))}
              </div>
              <div className="bx-slots">
                <span className="bx-piece">我</span>
                <span className="bx-hole" />
                <span className="bx-hole" />
              </div>
            </div>
            <figcaption className="bx-label">{v.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
