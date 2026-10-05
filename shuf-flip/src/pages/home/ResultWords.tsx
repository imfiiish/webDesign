import { useState, type CSSProperties } from 'react'
import { useI18n } from '../../i18n'
import { Chart } from './ResultCharts'
import {
  LEARNED,
  MAX,
  NEW,
  REVIEW,
  TOTAL,
  type Kind,
  type Learned,
} from './resultWordsData'
import './resultWords.css'

/* ------------------------------------------------------------------ *
 * Variants — each is a self-contained take on the "words learned"
 * block from the Flip · Results scene.
 * ------------------------------------------------------------------ */

/** 01 — Ledger: an ordered list with leader dots and a share underline. */
function Ledger() {
  const { t } = useI18n()
  return (
    <div className="wv wv-ledger">
      <div className="lv-head">
        <span>{t('results.encountered')}</span>
        <span>{t('results.reveals')}</span>
      </div>
      <ol className="lv-list">
        {LEARNED.map((d, i) => (
          <li
            key={d.w}
            className={d.kind}
            style={{ '--p': d.n / MAX, '--d': `${i * 42}ms` } as CSSProperties}
          >
            <span className="lv-word">{d.w}</span>
            <span className="lv-leader" aria-hidden="true" />
            <span className="lv-n">×{d.n}</span>
            <span className="lv-bar" aria-hidden="true" />
          </li>
        ))}
      </ol>
      <p className="lv-foot">
        <b>{NEW.length}</b> {t('results.new')} · <b>{REVIEW.length}</b>{' '}
        {t('results.review')} · <b>{TOTAL}</b> {t('results.reveals')}
      </p>
    </div>
  )
}

/** 02 — Word cloud: chips whose size tracks the reveal count. */
function Chips() {
  const { t } = useI18n()
  return (
    <div className="wv wv-chips">
      <ul className="ch-list">
        {LEARNED.map((d, i) => (
          <li
            key={d.w}
            className={`ch ${d.kind}`}
            style={{ '--n': d.n, '--d': `${i * 55}ms` } as CSSProperties}
          >
            {d.w}
            <span className="ch-n">×{d.n}</span>
          </li>
        ))}
      </ul>
      <p className="ch-foot">{t('results.encountered')}</p>
    </div>
  )
}

/** 03 — Sticker tiles: a light grid with a corner count badge. */
function Tiles() {
  return (
    <div className="wv wv-tiles">
      <ul className="tl-grid">
        {LEARNED.map((d, i) => (
          <li
            key={d.w}
            className={`tl-tile ${d.kind}`}
            style={{ '--d': `${i * 42}ms` } as CSSProperties}
          >
            <span className="tl-word">{d.w}</span>
            <span className="tl-badge">×{d.n}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 04 — Rings: a progress ring per word, filled by its reveal share. */
function Rings() {
  return (
    <div className="wv wv-rings">
      <ul className="rg-grid">
        {LEARNED.map((d, i) => {
          const pct = (d.n / MAX) * 100
          return (
            <li
              key={d.w}
              className={`rg ${d.kind}`}
              style={{ '--d': `${i * 45}ms` } as CSSProperties}
            >
              <span className="rg-ring">
                <svg viewBox="0 0 72 72" aria-hidden="true">
                  <circle className="rg-track" cx="36" cy="36" r="30" />
                  <circle
                    className="rg-arc"
                    cx="36"
                    cy="36"
                    r="30"
                    pathLength={100}
                    strokeDasharray={100}
                    strokeDashoffset={100 - pct}
                  />
                </svg>
                <b className="rg-n">×{d.n}</b>
              </span>
              <span className="rg-word">{d.w}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** 05 — Receipt: a monospace ticket with dashed rules and a total. */
function Receipt() {
  const { t } = useI18n()
  return (
    <div className="wv wv-receipt">
      <div className="rcpt">
        <p className="rcpt-kicker">{t('results.encountered')}</p>
        <p className="rcpt-date">ROUND 03 · 2026</p>
        <span className="rcpt-rule" />
        <ul className="rcpt-list">
          {LEARNED.map((d) => (
            <li key={d.w}>
              <span>{d.w}</span>
              <i />
              <b>×{d.n}</b>
            </li>
          ))}
        </ul>
        <span className="rcpt-rule" />
        <p className="rcpt-line">
          <span>{t('results.new')}</span>
          <b>{NEW.length}</b>
        </p>
        <p className="rcpt-line">
          <span>{t('results.review')}</span>
          <b>{REVIEW.length}</b>
        </p>
        <p className="rcpt-total">
          <span>{t('results.reveals')}</span>
          <b>{TOTAL}</b>
        </p>
        <div className="rcpt-bar" aria-hidden="true" />
        <p className="rcpt-thanks">{t('results.continue')}</p>
      </div>
    </div>
  )
}

/** 06 — Columns: an editorial split of new against review. */
function Columns() {
  const { t } = useI18n()
  const column = (title: string, rows: Learned[], cls: Kind) => (
    <div className={`cl-col ${cls}`}>
      <h4 className="cl-head">
        <span className="cl-dot" />
        {title}
        <b>{rows.length}</b>
      </h4>
      <ul className="cl-list">
        {rows.map((d, i) => (
          <li
            key={d.w}
            style={{ '--p': d.n / MAX, '--d': `${i * 45}ms` } as CSSProperties}
          >
            <span className="cl-word">{d.w}</span>
            <span className="cl-n">×{d.n}</span>
            <span className="cl-bar" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </div>
  )
  return (
    <div className="wv wv-columns">
      {column(t('results.new'), NEW, 'new')}
      {column(t('results.review'), REVIEW, 'review')}
    </div>
  )
}

/** 07 — Focus: one hero word; the strip below switches it. */
function Focus() {
  const { t } = useI18n()
  const [active, setActive] = useState(0)
  const d = LEARNED[active]
  return (
    <div className="wv wv-focus">
      <div className={`fc-hero ${d.kind}`} key={d.w}>
        <span className="fc-kind">
          {t(d.kind === 'new' ? 'results.new' : 'results.review')}
        </span>
        <span className="fc-word">{d.w}</span>
        <div className="fc-meta">
          <b>×{d.n}</b>
          <span>{t('results.reveals')}</span>
        </div>
      </div>
      <ul className="fc-strip">
        {LEARNED.map((w, i) => (
          <li key={w.w}>
            <button
              type="button"
              className={`fc-chip ${w.kind}${i === active ? ' on' : ''}`}
              onClick={() => setActive(i)}
            >
              {w.w}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 08 — Heat: one cell per word, filled by how often it came up. */
function Heat() {
  const { t } = useI18n()
  return (
    <div className="wv wv-heat">
      <ul className="ht-grid">
        {LEARNED.map((d, i) => (
          <li
            key={d.w}
            className={`ht-cell ${d.kind}`}
            style={
              {
                '--a': 0.14 + (d.n / MAX) * 0.86,
                '--d': `${i * 36}ms`,
              } as CSSProperties
            }
          >
            <span className="ht-word">{d.w}</span>
            <span className="ht-n">×{d.n}</span>
          </li>
        ))}
      </ul>
      <p className="ht-foot">{t('results.encountered')}</p>
    </div>
  )
}

/** Creative: eight ways to read the words learned this round. */
export default function ResultWords() {
  const { t } = useI18n()
  return (
    <div className="charts">
      <Chart
        label={`01 · ${t('results.words.ledger')}`}
        caption={t('results.words.cap.ledger')}
      >
        <Ledger />
      </Chart>
      <Chart
        label={`02 · ${t('results.words.chips')}`}
        caption={t('results.words.cap.chips')}
      >
        <Chips />
      </Chart>
      <Chart
        label={`03 · ${t('results.words.tiles')}`}
        caption={t('results.words.cap.tiles')}
      >
        <Tiles />
      </Chart>
      <Chart
        label={`04 · ${t('results.words.rings')}`}
        caption={t('results.words.cap.rings')}
      >
        <Rings />
      </Chart>
      <Chart
        label={`05 · ${t('results.words.receipt')}`}
        caption={t('results.words.cap.receipt')}
      >
        <Receipt />
      </Chart>
      <Chart
        label={`06 · ${t('results.words.columns')}`}
        caption={t('results.words.cap.columns')}
      >
        <Columns />
      </Chart>
      <Chart
        label={`07 · ${t('results.words.focus')}`}
        caption={t('results.words.cap.focus')}
      >
        <Focus />
      </Chart>
      <Chart
        label={`08 · ${t('results.words.heat')}`}
        caption={t('results.words.cap.heat')}
      >
        <Heat />
      </Chart>
    </div>
  )
}
