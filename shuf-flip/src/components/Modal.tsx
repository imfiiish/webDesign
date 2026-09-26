import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useI18n } from '../i18n'
import './modal.css'

type Props = {
  onClose: () => void
  ariaLabel: string
  className?: string
  /** Set false to ignore Esc (e.g. while renaming). */
  closeOnEscape?: boolean
  children: ReactNode
}

/** Modal shell: backdrop click + close button + Esc to close. */
export default function Modal({
  onClose,
  ariaLabel,
  className = '',
  closeOnEscape = true,
  children,
}: Props) {
  const { t } = useI18n()

  useEffect(() => {
    if (!closeOnEscape) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeOnEscape, onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal${className ? ` ${className}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="icon-btn modal-close"
          onClick={onClose}
          aria-label={t('common.close')}
          title={t('common.close')}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  )
}
