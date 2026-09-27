import { useState } from 'react'
import { useI18n } from '../../i18n'
import { FONTS, type FontSpec } from './fonts'
import './design.css'

const SCALE = [
  { size: 2.6, text: 'Aa Bb Cc' },
  { size: 1.8, text: 'The quick brown fox' },
  { size: 1.3, text: 'jumps over the lazy dog' },
]

const WEIGHTS = [
  { label: 'Regular', weight: 400 },
  { label: 'Medium', weight: 500 },
  { label: 'Bold', weight: 700 },
]

const PARAGRAPH = {
  zh: '排版为语言赋予持久的视觉形式：字形的形态、字里行间的节奏，以及阅读时的舒适感。',
  en: 'Typography gives language a durable visual form: the shape of the letters, the rhythm of the lines, and the ease of the reading eye.',
}

const PUNCT = '! ? . , : ; @ # % & * ( ) [ ] { } / \\ | ~'

/** The specimen: hero, weights, body copy, type scale and characters. */
function Specimen({ font }: { font: FontSpec }) {
  return (
    <div className="fh-full" style={{ fontFamily: `var(${font.cssVar})` }}>
      <div className="fh-sheet-hero">Aa</div>
      <p className="fh-sheet-lead">
        The quick brown fox jumps over the lazy dog
      </p>

      <div className="fh-weights">
        {WEIGHTS.map((w) => (
          <section className="fh-weight-block" key={w.weight}>
            <header className="fh-weight-head">
              <span className="fh-weight-name">{w.label}</span>
              <span className="fh-weight-num">{w.weight}</span>
            </header>
            <div className="fh-weight-sample" style={{ fontWeight: w.weight }}>
              The quick brown fox jumps over the lazy dog
            </div>
          </section>
        ))}
      </div>

      <div className="fh-sheet-body">
        <p>{PARAGRAPH.zh}</p>
        <p className="dim">{PARAGRAPH.en}</p>
      </div>

      <div className="fh-scale">
        {SCALE.map((l) => (
          <div className="fh-scale-line" key={l.size}>
            <span
              className="fh-scale-text"
              style={{ fontSize: `${l.size}rem` }}
            >
              {l.text}
            </span>
            <span className="fh-scale-size">{l.size}rem</span>
          </div>
        ))}
      </div>

      <div className="fh-sheet-strip">
        <span>0123456789</span>
        <span>{PUNCT}</span>
      </div>
    </div>
  )
}

/** Fonts specimen: a flush rail on the right lists the stacks; hovering one
 *  fills the stage with its identity block and the specimen. */
export default function FontHover() {
  const { lang } = useI18n()
  const [activeId, setActiveId] = useState(FONTS[0].id)
  const active = FONTS.find((f) => f.id === activeId) ?? FONTS[0]

  return (
    <div className="fh">
      <div className="fh-stage">
        <header className="fh-head">
          <span
            className="fh-title"
            style={{ fontFamily: `var(${active.cssVar})` }}
          >
            {active.family}
          </span>
          <span className="fh-role">{active.role[lang]}</span>
        </header>

        <dl className="fh-meta">
          <div>
            <dt>var</dt>
            <dd className="stack">{`var(${active.cssVar})`}</dd>
          </div>
          <div>
            <dt>stack</dt>
            <dd className="stack">{active.stack}</dd>
          </div>
          <div>
            <dt>use</dt>
            <dd>{active.note[lang]}</dd>
          </div>
        </dl>

        <Specimen font={active} />
      </div>

      <aside className="fh-rail">
        {FONTS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`fh-item${f.id === activeId ? ' on' : ''}`}
            onMouseEnter={() => setActiveId(f.id)}
            onFocus={() => setActiveId(f.id)}
            onClick={() => setActiveId(f.id)}
          >
            <span
              className="fh-item-name"
              style={{ fontFamily: `var(${f.cssVar})` }}
            >
              {f.family}
            </span>
            <span className="fh-item-role">{f.role[lang]}</span>
          </button>
        ))}
      </aside>
    </div>
  )
}
