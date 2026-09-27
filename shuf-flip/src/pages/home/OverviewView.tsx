import { Link } from 'react-router-dom'
import { COMPONENTS, PAGES } from '../../catalog'
import { useI18n } from '../../i18n'

/** Overview: the catalog as a bento board — pages big, components filling in. */
export default function OverviewView() {
  const { lang, t } = useI18n()

  return (
    <>
      <div className="bento">
        {PAGES.map((e) => {
          const body = (
            <>
              <span className="kind">{t('kind.page')}</span>
              <div>
                <h3>{e.title}</h3>
                <p>{e.description[lang]}</p>
              </div>
            </>
          )
          return e.status === 'ready' ? (
            <Link className="tile page" to={`/${e.id}`} key={e.id}>
              {body}
            </Link>
          ) : (
            <article className="tile page" key={e.id}>
              {body}
            </article>
          )
        })}
        {COMPONENTS.map((e, i) => (
          <article className={`tile${i % 3 === 0 ? ' wide' : ''}`} key={e.id}>
            <span className="kind">{t('kind.component')}</span>
            <div>
              <h3>{e.title}</h3>
              <p>{e.description[lang]}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
