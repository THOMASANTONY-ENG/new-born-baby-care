import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../components/style/login.css'
import { authenticateUser, getRoleFromEmail, navigateTo } from '../utils/navigation'

const initialLoginForm = {
  email: '',
  password: '',
  rememberMe: true,
}

const careMoments = [
  'Parents can review baby routines, reminders, and health updates in one place.',
  'Doctors can check care records and stay aligned with ongoing support needs.',
  'Admins can manage platform activity, access, and daily operations securely.',
]

const LoginPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialLoginForm)
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [signedInUser, setSignedInUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!submitted) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      navigate('/dashboard')
    }, 1000)

    return () => window.clearTimeout(timeoutId)
  }, [navigate, submitted])

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = authenticateUser(formData.email, formData.password)

    if (!result.success) {
      setErrorMessage(result.message)
      return
    }

    setSignedInUser(result.user)
    setErrorMessage('')
    setSubmitted(true)
  }

  const handleRegisterNavigation = (event) => {
    event.preventDefault()
    navigateTo('/register')
  }

  const detectedRole = getRoleFromEmail(formData.email)

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="container login-header-inner">
          <a className="login-brand" href="/">
            <span className="brand-mark">BB</span>
            <span>BabyBloom</span>
          </a>

          <div className="login-header-actions">
            <a className="btn btn-outline-primary login-nav-btn" href="/">
              Back Home
            </a>
            <a
              className="btn btn-outline-primary login-nav-btn"
              href="/register"
              onClick={handleRegisterNavigation}
            >
              Create Account
            </a>
            <a className="btn btn-primary login-nav-btn" href="#login-form">
              Sign In
            </a>
          </div>
        </div>
      </header>

      <main className="login-main">
        <section className="login-hero">
          <div className="container">
            <div className="row g-4 align-items-center">
              <div className="col-lg-5" style={{ overflow: 'hidden' }}>
                <div className="login-copy">
                  <span className="login-kicker">One secure sign-in for every care role</span>
                  <h1>Sign in for parent, admin, or doctor access</h1>
                  <p>
                    Access the right BabyBloom workspace for care tracking, clinical support,
                    or platform management from one shared login page.
                  </p>

                  <div className="login-highlights">
                    <span>Parent access</span>
                    <span>Doctor access</span>
                    <span>Admin access</span>
                  </div>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="login-shell" id="login-form">
                  <div className="row g-0">
                    <div className="col-xl-5">
                      <aside className="login-panel">
                        <span className="login-panel-label">What waits for you inside</span>
                        <h2>Your BabyBloom workspace, ready when you are.</h2>
                        <ul className="login-benefits">
                          {careMoments.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>

                        <div className="login-stat-card">
                          <strong>Enter the right workspace in seconds</strong>
                          <p>
                            Sign in to continue with the tools and information that match
                            your role.
                          </p>
                        </div>
                      </aside>
                    </div>

                    <div className="col-xl-7">
                      <div className="login-form-card">
                        <div className="login-form-heading">
                          <span className="login-step">Secure access</span>
                          <h2>Account login</h2>
                          <p>Use your email and password to enter your BabyBloom workspace.</p>
                        </div>

                        {errorMessage && !submitted && (
                          <div className="alert alert-danger py-2" role="alert">
                            {errorMessage}
                          </div>
                        )}

                        {submitted ? (
                          <div className="login-success" role="status">
                            <h3>Signed in successfully</h3>
                            <p>
                              {signedInUser?.email} was matched to the{' '}
                              <strong>{signedInUser?.role}</strong> dashboard. Redirecting now.
                            </p>
                            <a className="btn btn-primary" href="/dashboard">
                              Open dashboard
                            </a>
                          </div>
                        ) : (
                          <form className="login-form" onSubmit={handleSubmit}>
                            <div className="row g-3">
                              <div className="col-12">
                                <label className="form-label" htmlFor="email">
                                  Email address
                                </label>
                                <input
                                  className="form-control"
                                  id="email"
                                  name="email"
                                  type="email"
                                  placeholder="name@babybloom.com"
                                  value={formData.email}
                                  onChange={handleChange}
                                  required
                                />
                                <div
                                  className="mt-2 p-2 px-3 rounded-3 d-flex gap-2 align-items-start"
                                  style={{
                                    background: 'rgba(215,240,232,0.6)',
                                    border: '1px solid rgba(70,113,101,0.2)',
                                    fontSize: '0.85rem',
                                    color: '#467165',
                                  }}
                                  role="note"
                                >
                                  <span style={{ marginTop: 1 }}>i</span>
                                  <span>
                                    <strong>admin@...</strong> {'->'} Admin dashboard.
                                    <strong> Admin-added doctor email</strong> {'->'} Doctor
                                    dashboard. All other emails {'->'} Parent dashboard.
                                  </span>
                                </div>
                              </div>

                              <div className="col-12">
                                <label className="form-label" htmlFor="password">
                                  Password
                                </label>
                                <div className="login-password-row">
                                  <input
                                    className="form-control"
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                  />
                                  <button
                                    className="btn btn-outline-primary login-toggle"
                                    type="button"
                                    onClick={() => setShowPassword((current) => !current)}
                                  >
                                    {showPassword ? 'Hide' : 'Show'}
                                  </button>
                                </div>
                              </div>

                              <div className="col-12">
                                <div className="login-form-meta">
                                  <label className="login-check">
                                    <input
                                      name="rememberMe"
                                      type="checkbox"
                                      checked={formData.rememberMe}
                                      onChange={handleChange}
                                    />
                                    <span>Keep me signed in on this device</span>
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="login-stat-card mt-4">
                              <strong>Detected role: {detectedRole}</strong>
                              <p className="mb-0">
                                Doctor login works with the email and password set by admin in the
                                doctor directory.
                              </p>
                            </div>

                            <button className="btn btn-primary login-submit" type="submit">
                              Sign in now
                            </button>

                            <p className="login-switch-copy">
                              New to BabyBloom?{' '}
                              <a href="/register" onClick={handleRegisterNavigation}>
                                Create an account
                              </a>
                            </p>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LoginPage
