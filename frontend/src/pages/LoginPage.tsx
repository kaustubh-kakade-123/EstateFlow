import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiError'
import { useAuth } from '../features/auth/useAuth'

interface LocationState {
  from?: string
  registrationSuccess?: boolean
}

function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const state = location.state as LocationState | null
  const destination = state?.from ?? '/'

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({
        email: email.trim(),
        password,
      })

      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Unable to sign in. Check your email and password.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="section">
      <div className="container form-container">
       <div className="auth-card">
  <div className="section-heading">
    <p className="eyebrow">ACCOUNT ACCESS</p>
    <h1>Sign in to EstateFlow</h1>
    <p>
      Access your marketplace and CRM workspace using your EstateFlow
      account.
    </p>
  </div>

  {state?.registrationSuccess && (
    <div className="alert alert-success" role="status">
      Account created successfully. You can now sign in.
    </div>
  )}

  {error && (
    <div className="alert alert-error" role="alert">
      {error}
    </div>
  )}

  <form className="form-stack" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label className="form-field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            <button
              className="button button-primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            New to EstateFlow? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default LoginPage