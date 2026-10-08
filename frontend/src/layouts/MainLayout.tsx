import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

function MainLayout() {
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    hasRole,
  } = useAuth()

  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-content">
          <Link className="brand" to="/">
            EstateFlow
          </Link>

          <nav className="main-nav" aria-label="Main navigation">
            <NavLink to="/">Properties</NavLink>

            {!isLoading && isAuthenticated && (
              <>
                {!hasRole('ADMIN') && (
  <NavLink to="/dashboard">Dashboard</NavLink>
)}

                {hasRole('BUYER') && (
                  <>
                    <NavLink to="/shortlist">My Shortlist</NavLink>
                    <NavLink to="/enquiries">My Enquiries</NavLink>
                  </>
                )}
                {(hasRole('OWNER') || hasRole('BUILDER')) && (
  <NavLink to="/my-properties">My Properties</NavLink>
)}
{hasRole('ADMIN') && (
  <>
    <NavLink to="/admin/dashboard">Admin Dashboard</NavLink>
    <NavLink to="/admin/properties">Property Moderation</NavLink>
  </>
)}

{(hasRole('ADMIN') || hasRole('AGENT')) && (
  <NavLink to="/leads">Lead CRM</NavLink>
)}

                <span className="nav-user">{user?.fullName}</span>

                <button
                  className="nav-button"
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}

            {!isLoading && !isAuthenticated && (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            )}
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