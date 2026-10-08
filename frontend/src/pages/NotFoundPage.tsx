import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="section">
      <div className="container narrow-container">
        <div className="placeholder-panel">
          <p className="eyebrow">404</p>
          <h1>Page not found</h1>
          <p>The page you requested does not exist.</p>

          <Link className="button button-primary" to="/">
            Back to Properties
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage