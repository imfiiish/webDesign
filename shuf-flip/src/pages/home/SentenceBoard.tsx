import { Fragment } from 'react'
import { GameFooter, Typer } from './SentenceGame'
import { toneless, useSentenceGame } from './sentenceEngine'
import type { SentenceGame } from './sentenceEngine'
import './sentenceBoard.css'

/** The English sentence as inline words. A word tied to a token lights up green
 *  once that token is right, and flashes red for a beat when it is wrong. */
function EnWords({
  game,
  wordClass,
}: {
  game: SentenceGame
  wordClass: string
}) {
  return (
    <>
      {game.words.map((word, i) => {
        const good = word.owners.length > 0 && word.owners.every(game.done)
        const bad = word.owners.length > 0 && word.owners.some(game.failed)
        const state = good
          ? ' good'
          : bad && game.flash.length > 0
            ? ' flash'
            : ''
        return (
          <Fragment key={i}>
            <span className={`${wordClass}${state}`}>{word.text}</span>{' '}
          </Fragment>
        )
      })}
    </>
  )
}

/** The shuffled word bank, as a row of paper chips. */
function Bank({
  game,
  trayClass,
  chipClass,
}: {
  game: SentenceGame
  trayClass: string
  chipClass: string
}) {
  return (
    <div className={trayClass}>
      {game.bank.map((j) => {
        const token = game.entry.tokens[j]
        const used = game.slots.some((s) => s.token === j)
        const hint =
          !used &&
          game.typed !== '' &&
          toneless(token.pinyin).startsWith(game.typed)
        return (
          <button
            key={`${game.entry.order}-${j}`}
            type="button"
            className={`${chipClass}${used ? ' used' : ''}${hint ? ' hint' : ''}`}
            disabled={used}
            onClick={() => game.pick(j)}
          >
            <span className={`${chipClass}-text`}>{token.text}</span>
            <span className={`${chipClass}-pinyin`}>{token.pinyin}</span>
          </button>
        )
      })}
    </div>
  )
}

/** The invisible input that keeps keyboard capture. */
function TyperFor({ game }: { game: SentenceGame }) {
  return (
    <Typer
      typer={game.typer}
      value={game.pending}
      onType={game.onType}
      onKey={game.onKey}
    />
  )
}

/** Creative › Sentence — the grammar exercise. The full English sentence is the
 *  prompt card, the shuffled tokens are a recessed tray, and the blanks sit
 *  under them. Click a token or type its pinyin; Space/Tab move on, Backspace
 *  steps back, Enter submits. */
export default function SentenceBoard() {
  const g = useSentenceGame()

  return (
    <article className="sv">
      <TyperFor game={g} />

      <div className="sv-prompt">
        <span className="sv-tag">Prompt</span>
        <p className="sv-en">
          <EnWords game={g} wordClass="sv-en-word" />
        </p>
      </div>

      <div className="sv-board">
        <Bank game={g} trayClass="sv-rack" chipClass="sv-chip" />

        <div className="sv-slots">
          {g.entry.tokens.map((_, i) => {
            const token = g.slots[i].token
            const filled = token !== null ? g.entry.tokens[token] : null
            const state = g.done(i) ? ' good' : g.flash[i] ? ' flash' : ''
            const active = i === g.active
            const here = active && g.pending !== ''
            return (
              <div className={`sv-slot${state}`} key={i}>
                {filled ? (
                  <button
                    type="button"
                    className="sv-piece"
                    onClick={() => g.remove(i)}
                  >
                    {filled.text}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`sv-hole${active ? ' active' : ''}`}
                    onClick={() => g.selectBlank(i)}
                  >
                    {here ? (
                      <span className="sf-pending sv-pending">{g.pending}</span>
                    ) : active ? (
                      <span className="sv-caret" />
                    ) : null}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <GameFooter game={g} />
    </article>
  )
}
