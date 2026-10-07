import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiError'
import { register } from '../features/auth/auth.service'
import type { RegisterRequest } from '../features/auth/auth.types'
import { useAuth } from '../features/auth/useAuth'

function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [form, setForm] = useState<RegisterRequest>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'BUYER',
  })

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await register({
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || null,
      })

      navigate('/login', {
        replace: true,
        state: {
          registrationSuccess: true,
        },
      })
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Unable to create your account. Please check your details.',
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
            <p className="eyebrow">CREATE ACCOUNT</p>
            <h1>Join EstateFlow</h1>
            <p>
              Register as a buyer, property owner or builder. Agent and admin
              accounts are managed internally.
            </p>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Full name</span>
              <input
                type="text"
                value={form.fullName}
                onChange={(event) =>
                  setForm({ ...form, fullName: event.target.value })
                }
                maxLength={120}
                autoComplete="name"
                required
              />
            </label>

            <label className="form-field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                maxLength={190}
                autoComplete="email"
                required
              />
            </label>

            <label className="form-field">
              <span>Phone (optional)</span>
              <input
                type="tel"
                value={form.phone ?? ''}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                pattern="[0-9]{10,15}"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="10 to 15 digits"
              />
            </label>

            <label className="form-field">
              <span>Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                required
              />
              <small>Use 8 to 72 characters.</small>
            </label>

            <label className="form-field">
              <span>Account type</span>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm({
                    ...form,
                    role: event.target.value as RegisterRequest['role'],
                  })
                }
                required
              >
                <option value="BUYER">Buyer</option>
                <option value="OWNER">Property Owner</option>
                <option value="BUILDER">Builder</option>
              </select>
            </label>

            <button
              className="button button-primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default RegisterPage