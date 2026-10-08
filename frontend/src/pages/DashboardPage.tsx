import { useAuth } from '../features/auth/useAuth'

function DashboardPage() {
  const { user } = useAuth()

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">WORKSPACE</p>
          <h1>Welcome, {user?.fullName}</h1>
          <p>
            Your EstateFlow workspace will provide role-specific marketplace
            and CRM tools.
          </p>
        </div>

        <div className="placeholder-panel">
          <h3>Authenticated session</h3>
          <p>
            Signed in as <strong>{user?.email}</strong>
          </p>
          <p>
            Roles: <strong>{user?.roles.join(', ')}</strong>
          </p>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage