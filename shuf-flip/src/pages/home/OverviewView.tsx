import { Link } from 'react-router-dom'
import { COMPONENTS, PAGES } from '../../catalog'

/** Overview: the catalog as a bento board — pages big, components filling in. */
export default function OverviewView() {
  return (
    <>
      <p className="lede">
        Bento board: pages get big tiles, components fill the gaps. Hierarchy by
        size.
      </p>
      <div className="bento">
        {PAGES.map((e) => {
          const body = (
            <>
              <span className="kind">Page</span>
              <div>
                <h3>{e.title}</h3>
                <p>{e.description}</p>
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
            <span className="kind">Component</span>
            <div>
              <h3>{e.title}</h3>
              <p>{e.description}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
