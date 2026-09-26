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
        {PAGES.map((e) => (
          <article className="tile page" key={e.id}>
            <span className="kind">Page</span>
            <div>
              <h3>{e.title}</h3>
              <p>{e.description}</p>
            </div>
          </article>
        ))}
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
