import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n'

type Props = {
  /** Round-button class; pages style it slightly differently. */
  className?: string
  /** i18n key for the aria / title label. */
  labelKey?: string
}

/** Top-left "back to catalog" round button, shared across the pages. */
export default function BackButton({
  className = 'deck-home',
  labelKey = 'nav.back',
}: Props) {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <button
      type="button"
      className={className}
      onClick={() => navigate('/')}
      aria-label={t(labelKey)}
      title={t(labelKey)}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </button>
  )
}
