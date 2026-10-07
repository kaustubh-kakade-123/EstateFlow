import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-content">
          <p className="eyebrow">REAL ESTATE MARKETPLACE &amp; LEAD CRM</p>

          <h1>Discover properties. Connect with the right people.</h1>

          <p className="hero-description">
            EstateFlow connects property discovery with a structured real-estate
            sales journey, from enquiry and site visit to follow-up and
            conversion.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#properties">
              Explore Properties
            </a>

            <Link className="button button-secondary" to="/login">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="properties">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">PROPERTY DISCOVERY</p>
            <h2>Find your next property</h2>
            <p>
              Search and filtering will connect to the EstateFlow Spring Boot
              API in the next implementation step.
            </p>
          </div>

          <div className="placeholder-panel">
            <h3>Property marketplace coming next</h3>
            <p>
              Public property search, filters, property cards and property
              details will appear here.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage