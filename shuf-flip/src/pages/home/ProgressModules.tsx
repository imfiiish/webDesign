import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { useI18n } from '../../i18n'
import './progressModules.css'

/* ------------------------------------------------------------------ *
 * Progress page module: a month calendar of study activity, sized to
 * live in a right-hand rail.
 * ------------------------------------------------------------------ */

/** Deterministic activity level (0–4) for a given day. */
function levelOf(day: number, month: number): number {
  const x = Math.sin(day * 12.9898 + month * 3.7) * 43758.5453
  const r = x - Math.floor(x)
  return r < 0.24 ? 0 : 1 + Math.floor(r * 4)
}

export function CalendarModule() {
  const { lang } = useI18n()
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US'

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Monday-first column for the 1st of the month
  const firstCol = (new Date(year, month, 1).getDay() + 6) % 7

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1))

  const wdFmt = new Intl.DateTimeFormat(locale, { weekday: 'narrow' })
  // 2024-01-01 is a Monday
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    wdFmt.format(new Date(2024, 0, 1 + i)),
  )

  const cells: (number | null)[] = [
    ...Array.from({ length: firstCol }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="pm-cal">
      <div className="pm-cal-head">
        <button type="button" className="pm-nav" aria-label="previous">
          ‹
        </button>
        <span className="pm-month">{monthLabel}</span>
        <button type="button" className="pm-nav" aria-label="next">
          ›
        </button>
      </div>

      <div className="pm-week" aria-hidden="true">
        {weekdays.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>

      <div className="pm-grid">
        {cells.map((d, i) =>
          d === null ? (
            <span key={i} className="pm-blank" />
          ) : (
            <span
              key={i}
              className={`pm-day l${levelOf(d, month)}${
                d === today ? ' today' : ''
              }${d > today ? ' future' : ''}`}
            >
              {d}
            </span>
          ),
        )}
      </div>
    </div>
  )
}

/** Today: how many new words were learned and how many were reviewed. */
function TodayModule() {
  const { t } = useI18n()
  return (
    <div className="pm-today">
      <div className="pm-stat new">
        <b>3</b>
        <span>{t('results.new')}</span>
      </div>
      <div className="pm-stat review">
        <b>2</b>
        <span>{t('results.review')}</span>
      </div>
    </div>
  )
}

/** Today, second take: the day's total, split into new vs review. */
function TodaySplitModule() {
  const { t } = useI18n()
  const fresh = 3
  const review = 2
  const total = fresh + review
  return (
    <div className="pm-today-split">
      <div className="pm-ts-head">
        <b>{total}</b>
        <span>{t('progress.mod.todayWords')}</span>
      </div>
      <div
        className="pm-ts-bar"
        role="img"
        aria-label={`${t('results.new')} ${fresh} · ${t('results.review')} ${review}`}
      >
        <span className="new" style={{ flexGrow: fresh }} />
        <span className="review" style={{ flexGrow: review }} />
      </div>
      <div className="pm-ts-legend">
        <span className="new">
          <i aria-hidden="true" />
          {t('results.new')} <b>{fresh}</b>
        </span>
        <span className="review">
          <i aria-hidden="true" />
          {t('results.review')} <b>{review}</b>
        </span>
      </div>
    </div>
  )
}

/** Today · hero — a hero total beside two stacked blocks. */
function TodayHeroModule() {
  const { t } = useI18n()
  const fresh = 3
  const review = 2
  return (
    <div className="pm-today-num">
      <div className="pm-hero">
        <span className="pm-hero-main">
          <b>{fresh + review}</b>
          <small>{t('progress.mod.todayWords')}</small>
        </span>
        <span className="pm-hero-side">
          <span className="new">
            <b>{fresh}</b>
            <small>{t('results.new')}</small>
          </span>
          <span className="review">
            <b>{review}</b>
            <small>{t('results.review')}</small>
          </span>
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Card-scale takes on today's numbers — sized for the Progress page's
 * wide card beside the pie, not the narrow rail.
 * ------------------------------------------------------------------ */

type Slice = 'new' | 'review'

const DAY = { new: 180, review: 120 } as const
const DAY_TOTAL = DAY.new + DAY.review
const NEW_PCT = (DAY.new / DAY_TOTAL) * 100
const REVIEW_PCT = 100 - NEW_PCT
const REVIEW_TURN = -90 + NEW_PCT * 3.6

/** The counts column on the right of every ring take. */
function CountsSide({
  active,
  onHover,
  onPick,
}: {
  active: Slice | null
  onHover?: (k: Slice) => void
  onPick?: (k: Slice) => void
}) {
  const { t } = useI18n()
  return (
    <span className={`pm-hw-side${active ? ' has-on' : ''}`}>
      {(['new', 'review'] as const).map((k) => (
        <span
          key={k}
          className={`${k}${active === k ? ' on' : ''}`}
          onMouseEnter={onHover ? () => onHover(k) : undefined}
          onClick={onPick ? () => onPick(k) : undefined}
        >
          <b>{DAY[k]}</b>
          <small>{t(k === 'new' ? 'results.new' : 'results.review')}</small>
        </span>
      ))}
    </span>
  )
}

/** The ring face: two arcs + a centre readout. Offsets run on a pathLength
 *  of 100, so a slice is full at offset 0 and empty at 100. */
function RingDial({
  newOffset,
  reviewOffset,
  newCls = '',
  reviewCls = '',
  onHover,
  onPick,
  children,
}: {
  newOffset: number
  reviewOffset: number
  newCls?: string
  reviewCls?: string
  onHover?: (k: Slice) => void
  onPick?: (k: Slice) => void
  children: ReactNode
}) {
  const turn = (k: Slice) =>
    k === 'new' ? 'rotate(-90 60 60)' : `rotate(${REVIEW_TURN} 60 60)`
  return (
    <div className="pm-ring-dial">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="pm-ring-track" cx="60" cy="60" r="50" />
        {(['new', 'review'] as const).map((k) => (
          <circle
            key={k}
            className={`pm-ring-arc ${k} ${k === 'new' ? newCls : reviewCls}`}
            cx="60"
            cy="60"
            r="50"
            pathLength={100}
            strokeDasharray="100 100"
            strokeDashoffset={k === 'new' ? newOffset : reviewOffset}
            transform={turn(k)}
          />
        ))}
        {(onHover || onPick) &&
          (['new', 'review'] as const).map((k) => (
            <circle
              key={k}
              className="pm-ring-hit"
              cx="60"
              cy="60"
              r="50"
              pathLength={100}
              strokeDasharray="100 100"
              strokeDashoffset={k === 'new' ? newOffset : reviewOffset}
              transform={turn(k)}
              onMouseEnter={onHover ? () => onHover(k) : undefined}
              onClick={onPick ? () => onPick(k) : undefined}
            />
          ))}
      </svg>
      <span className="pm-ring-center">{children}</span>
    </div>
  )
}

/** 06 · ring — arcs draw in; hovering a count dims the other slice, lights
 *  this one up, and swaps the centre to that number. */
export function TodayRingWideModule({
  dividers = true,
}: {
  dividers?: boolean
} = {}) {
  const { t } = useI18n()
  const [active, setActive] = useState<Slice | null>(null)
  const num = active ? DAY[active] : DAY_TOTAL
  const cap = active
    ? t(active === 'new' ? 'results.new' : 'results.review')
    : t('progress.mod.todayWords')
  return (
    <div
      className={`pm-today-card pm-ring-card${
        dividers ? '' : ' no-dividers'
      }`}
      onMouseLeave={() => setActive(null)}
    >
      <div className="pm-ring-left">
        <RingDial
          newOffset={100 - NEW_PCT}
          reviewOffset={100 - REVIEW_PCT}
          newCls={`draw${active === 'new' ? ' on' : active ? ' dim' : ''}`}
          reviewCls={`draw${active === 'review' ? ' on' : active ? ' dim' : ''}`}
          onHover={setActive}
        >
          <b key={num} className={`pm-ring-num${active ? ` ${active}` : ''}`}>
            {num}
          </b>
          <small key={cap}>{cap}</small>
        </RingDial>
      </div>
      <CountsSide active={active} onHover={setActive} />
    </div>
  )
}

/** 10 · pick — click a slice and the ring morphs to fill with it; click it
 *  again to drop back to the split. */
export function TodayPickWideModule() {
  const { t } = useI18n()
  const [picked, setPicked] = useState<Slice | null>(null)
  const pick = (k: Slice) => setPicked((p) => (p === k ? null : k))

  const newOffset =
    picked === 'new' ? 0 : picked === 'review' ? 100 : 100 - NEW_PCT
  const reviewOffset =
    picked === 'review' ? 0 : picked === 'new' ? 100 : 100 - REVIEW_PCT
  const num = picked ? DAY[picked] : DAY_TOTAL
  const cap = picked
    ? t(picked === 'new' ? 'results.new' : 'results.review')
    : t('progress.mod.todayWords')

  return (
    <div className="pm-today-card pm-ring-card">
      <div className="pm-ring-left">
        <RingDial
          newOffset={newOffset}
          reviewOffset={reviewOffset}
          newCls={picked === 'new' ? 'picked' : picked === 'review' ? 'dim' : ''}
          reviewCls={
            picked === 'review' ? 'picked' : picked === 'new' ? 'dim' : ''
          }
          onPick={pick}
        >
          <b key={num} className={`pm-ring-num${picked ? ` ${picked}` : ''}`}>
            {num}
          </b>
          <small key={cap}>{cap}</small>
        </RingDial>
      </div>
      <CountsSide active={picked} onPick={pick} />
    </div>
  )
}

/** 11 · cycle — the focus rotates on its own; hovering pauses and previews,
 *  clicking pins a slice. The active arc pulses. */
export function TodayCycleWideModule() {
  const { t } = useI18n()
  const [auto, setAuto] = useState(0)
  const [hover, setHover] = useState<Slice | null>(null)
  const [pinned, setPinned] = useState<Slice | null>(null)
  const order: Slice[] = ['new', 'review']

  useEffect(() => {
    if (hover || pinned) return
    const id = setInterval(() => setAuto((i) => (i + 1) % 2), 2600)
    return () => clearInterval(id)
  }, [hover, pinned])

  const active = pinned ?? hover ?? order[auto]
  const num = DAY[active]
  const cap = t(active === 'new' ? 'results.new' : 'results.review')
  const pick = (k: Slice) => setPinned((p) => (p === k ? null : k))

  return (
    <div
      className="pm-today-card pm-ring-card"
      onMouseLeave={() => setHover(null)}
    >
      <div className="pm-ring-left">
        <RingDial
          newOffset={100 - NEW_PCT}
          reviewOffset={100 - REVIEW_PCT}
          newCls={active === 'new' ? 'pulse' : 'dim'}
          reviewCls={active === 'review' ? 'pulse' : 'dim'}
          onHover={setHover}
          onPick={pick}
        >
          <b key={num} className={`pm-ring-num ${active}`}>
            {num}
          </b>
          <small key={cap}>{cap}</small>
        </RingDial>
      </div>
      <CountsSide active={active} onHover={setHover} onPick={pick} />
    </div>
  )
}

/** 09 · units — one cell per word, green for new, blue for review. */
export function TodayUnitsWideModule() {
  const { t } = useI18n()
  const fresh = 3
  const review = 2
  const total = fresh + review
  const cells = [
    ...Array.from({ length: fresh }, () => 'new' as const),
    ...Array.from({ length: review }, () => 'review' as const),
  ]
  return (
    <div className="pm-today-card pm-units-card">
      <div className="pm-units-head">
        <b>{total}</b>
        <span>{t('progress.mod.todayWords')}</span>
      </div>
      <ul className="pm-units">
        {cells.map((k, i) => (
          <li
            key={i}
            className={k}
            style={{ '--d': `${i * 70}ms` } as CSSProperties}
          />
        ))}
      </ul>
      <div className="pm-units-legend">
        <span className="new">
          <i aria-hidden="true" />
          {t('results.new')} <b>{fresh}</b>
        </span>
        <span className="review">
          <i aria-hidden="true" />
          {t('results.review')} <b>{review}</b>
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * 08 · roll and 09 · spotlight — two more interaction-led takes.
 * ------------------------------------------------------------------ */

/** One odometer column: digits 0–9 stacked, slid to the active one. */
function RollDigit({ digit, delay }: { digit: number; delay: number }) {
  return (
    <span className="pm-roll-col">
      <span
        className="pm-roll-strip"
        style={{
          transform: `translateY(${-digit * 10}%)`,
          transitionDelay: `${delay}ms`,
        }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n}>{n}</span>
        ))}
      </span>
    </span>
  )
}

/** A fixed-width number rendered as rolling digit columns. */
function RollNumber({ value, places = 3 }: { value: number; places?: number }) {
  const digits = String(value)
    .padStart(places, '0')
    .split('')
    .map(Number)
  return (
    <span className="pm-roll-num">
      {digits.map((d, i) => (
        <RollDigit key={i} digit={d} delay={(digits.length - 1 - i) * 80} />
      ))}
    </span>
  )
}

/** 08 · roll — the counts arrive as rolling digits; hovering a pill rolls
 *  the number over to that slice. */
export function TodayRollWideModule() {
  const { t } = useI18n()
  const [active, setActive] = useState<'new' | 'review' | null>(null)
  const [mounted, setMounted] = useState(false)
  const fresh = 180
  const review = 120
  const total = fresh + review

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const target = active === 'new' ? fresh : active === 'review' ? review : total
  const cap =
    active === 'new'
      ? t('results.new')
      : active === 'review'
        ? t('results.review')
        : t('progress.mod.todayWords')

  return (
    <div
      className="pm-today-card pm-roll-card"
      onMouseLeave={() => setActive(null)}
    >
      <div className="pm-roll-head">
        <span className={`pm-roll-value${active ? ` ${active}` : ''}`}>
          <RollNumber value={mounted ? target : 0} />
        </span>
        <span className="pm-roll-cap" key={cap}>
          {cap}
        </span>
      </div>
      <div className="pm-roll-pills">
        <button
          type="button"
          className={`pm-roll-pill new${active === 'new' ? ' on' : ''}`}
          onMouseEnter={() => setActive('new')}
          onClick={() => setActive('new')}
        >
          <i aria-hidden="true" />
          {t('results.new')} <b>{fresh}</b>
        </button>
        <button
          type="button"
          className={`pm-roll-pill review${active === 'review' ? ' on' : ''}`}
          onMouseEnter={() => setActive('review')}
          onClick={() => setActive('review')}
        >
          <i aria-hidden="true" />
          {t('results.review')} <b>{review}</b>
        </button>
      </div>
    </div>
  )
}

/** The body the spotlight reveals: total over the two counts. */
function SpotBody() {
  const { t } = useI18n()
  const fresh = 180
  const review = 120
  return (
    <div className="pm-spot-body">
      <b className="pm-spot-total">{fresh + review}</b>
      <span className="pm-spot-cap">{t('progress.mod.todayWords')}</span>
      <div className="pm-spot-split">
        <span className="new">
          <i aria-hidden="true" />
          {t('results.new')} <b>{fresh}</b>
        </span>
        <span className="review">
          <i aria-hidden="true" />
          {t('results.review')} <b>{review}</b>
        </span>
      </div>
    </div>
  )
}

/** 09 · spotlight — the numbers sit muted; a torch follows the cursor and
 *  lights them up in colour. */
export function TodaySpotWideModule() {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    el.style.setProperty('--mx', `${x}px`)
    el.style.setProperty('--my', `${y}px`)
    el.style.setProperty('--rx', `${(y / r.height - 0.5) * -6}deg`)
    el.style.setProperty('--ry', `${(x / r.width - 0.5) * 6}deg`)
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div
      ref={ref}
      className="pm-today-card pm-spot-card"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <span className="pm-spot-torch" aria-hidden="true" />
      <div className="pm-spot-layer base">
        <SpotBody />
      </div>
      <div className="pm-spot-layer lit" aria-hidden="true">
        <SpotBody />
      </div>
    </div>
  )
}

/** The whole composition: both modules docked in a screen's right rail. */
function LayoutMock() {
  const { t } = useI18n()
  return (
    <div className="pm-screen">
      <div className="pm-screen-body" aria-hidden="true">
        <div className="pm-sk pm-sk-title" />
        <div className="pm-sk pm-sk-hero" />
        <div className="pm-sk-row">
          <div className="pm-sk" />
          <div className="pm-sk" />
        </div>
      </div>
      <aside className="pm-screen-rail">
        <div className="pm-rail-item">
          <h3 className="pm-rail-label">{t('progress.mod.calendar')}</h3>
          <CalendarModule />
        </div>
        <div className="pm-rail-item">
          <h3 className="pm-rail-label">{t('progress.mod.today')}</h3>
          <TodayModule />
        </div>
      </aside>
    </div>
  )
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="pm-item">
      <h3 className="pm-item-label">{label}</h3>
      {children}
    </section>
  )
}

/** Creative: the rail modules — the layout first, then each on its own. */
export default function ProgressModules() {
  const { t } = useI18n()
  return (
    <div className="pm-list">
      <Item label={`01 · ${t('progress.mod.layout')}`}>
        <LayoutMock />
      </Item>
      <Item label={`02 · ${t('progress.mod.calendar')}`}>
        <div className="pm-mod-stage">
          <div className="pm-mod">
            <CalendarModule />
          </div>
        </div>
      </Item>
      <Item label={`03 · ${t('progress.mod.today')}`}>
        <div className="pm-mod-stage">
          <div className="pm-mod">
            <TodayModule />
          </div>
        </div>
      </Item>
      <Item label={`04 · ${t('progress.mod.todaySplit')}`}>
        <div className="pm-mod-stage">
          <div className="pm-mod">
            <TodaySplitModule />
          </div>
        </div>
      </Item>
      <Item label={`05 · ${t('progress.mod.todayHero')}`}>
        <div className="pm-mod-stage">
          <div className="pm-mod">
            <TodayHeroModule />
          </div>
        </div>
      </Item>
      <Item label={`06 · ${t('progress.mod.todayRingCard')}`}>
        <div className="pm-mod-stage">
          <div className="pm-card-mock">
            <TodayRingWideModule />
          </div>
        </div>
      </Item>
      <Item label={`07 · ${t('progress.mod.todayUnitsCard')}`}>
        <div className="pm-mod-stage">
          <div className="pm-card-mock">
            <TodayUnitsWideModule />
          </div>
        </div>
      </Item>
      <Item label={`08 · ${t('progress.mod.todayRoll')}`}>
        <div className="pm-mod-stage">
          <div className="pm-card-mock">
            <TodayRollWideModule />
          </div>
        </div>
      </Item>
      <Item label={`09 · ${t('progress.mod.todaySpot')}`}>
        <div className="pm-mod-stage">
          <div className="pm-card-mock">
            <TodaySpotWideModule />
          </div>
        </div>
      </Item>
      <Item label={`10 · ${t('progress.mod.todayPick')}`}>
        <div className="pm-mod-stage">
          <div className="pm-card-mock">
            <TodayPickWideModule />
          </div>
        </div>
      </Item>
      <Item label={`11 · ${t('progress.mod.todayCycle')}`}>
        <div className="pm-mod-stage">
          <div className="pm-card-mock">
            <TodayCycleWideModule />
          </div>
        </div>
      </Item>
    </div>
  )
}
