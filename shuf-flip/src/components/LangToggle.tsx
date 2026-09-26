import { useI18n } from '../i18n'

/** zh / en toggle. Shows the current language; click to switch. */
export default function LangToggle({ className = 'tbtn' }: { className?: string }) {
  const { lang, setLang, t } = useI18n()

  return (
    <button
      type="button"
      className={className}
      onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
      aria-label={t('lang.toggle')}
      title={t('lang.toggle')}
    >
      {lang === 'zh' ? '中文' : 'EN'}
    </button>
  )
}
