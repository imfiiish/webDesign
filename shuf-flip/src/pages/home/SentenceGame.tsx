import type { KeyboardEvent, RefObject } from 'react'
import { useI18n } from '../../i18n'
import type { SentenceGame } from './sentenceEngine'

/** Props for the invisible input, kept explicit so the ref passes cleanly. */
type TyperProps = {
  typer: RefObject<HTMLInputElement | null>
  value: string
  onType: (value: string) => void
  onKey: (e: KeyboardEvent<HTMLInputElement>) => void
}

/** The invisible, always-focused input that captures every keystroke. */
export function Typer({ typer, value, onType, onKey }: TyperProps) {
  return (
    <input
      ref={typer}
      className="sf-typer"
      value={value}
      onChange={(e) => onType(e.target.value)}
      onKeyDown={onKey}
      inputMode="text"
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      aria-label="type pinyin"
    />
  )
}

/** The shared status line, so every board gives the same hints and score. */
export function GameFooter({ game }: { game: SentenceGame }) {
  const { t } = useI18n()
  const n = game.entry.tokens.length
  return (
    <footer className="sf-foot">
      <span className="sf-order">#{game.entry.order}</span>
      {game.results ? (
        <>
          <span className="sf-score">
            {game.score} / {n}
          </span>
          {game.score === n ? (
            <span>
              <kbd>Enter</kbd> {t('sentence.nextEntry')}
            </span>
          ) : (
            <span>
              <kbd>Enter</kbd> {t('sentence.retry')}
            </span>
          )}
        </>
      ) : (
        <>
          <span className="sf-howto">{t('sentence.howto')}</span>
          <span>
            <kbd>Space</kbd>/<kbd>Tab</kbd> {t('sentence.place')}
          </span>
          <span>
            <kbd>Enter</kbd> {t('sentence.submit')}
          </span>
        </>
      )}
    </footer>
  )
}
