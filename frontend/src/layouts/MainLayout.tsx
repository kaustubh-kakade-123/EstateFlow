import { Link, NavLink, Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-content">
          <Link className="brand" to="/">
            EstateFlow
          </Link>

          <nav className="main-nav" aria-label="Main navigation">
            <NavLink to="/">Properties</NavLink>
            <NavLink to="/login">Login</NavLink>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <strong>EstateFlow</strong>
          <span>Real Estate Marketplace &amp; Lead CRM</span>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout