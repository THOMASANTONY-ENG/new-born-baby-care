import React, { useEffect, useState } from 'react'
import '../components/style/register.css'
import { navigateTo, saveLoggedInUser } from '../utils/navigation'

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  babyDob: '',
  role: 'Mother',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
  subscribe: true,
}

const supportHighlights = [
  'Track feedings, sleep, and diaper changes in one gentle routine.',
  'Store doctor notes and vaccination reminders for quick access.',
  'Get a parent-friendly dashboard designed for the first year of care.',
]

const RegisterPage = () => {
  const [formData, setFormData] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!submitted) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      navigateTo('/dashboard')
    }, 1200)

    return () => window.clearTimeout(timeoutId)
  }, [submitted])

  const handleLoginNavigation = (event) => {
    event.preventDefault()
    navigateTo('/login')
  }

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    saveLoggedInUser(formData.email)
    setSubmitted(true)
  }

  return (
    <div className="register-page">
      <header className="register-header">
        <div className="container register-header-inner">
          <a className="register-brand" href="/">
            <span className="brand-mark">BB</span>
            <span>BabyBloom</span>
          </a>

          <div className="register-header-actions">
            <a className="btn btn-outline-primary register-nav-btn" href="/">
              Back Home
            </a>
            <a className="btn btn-outline-primary register-nav-btn" href="/login" onClick={handleLoginNavigation}>
              Sign In
            </a>
            <a className="btn btn-primary register-nav-btn" href="#register-form">
              Create Account
            </a>
          </div>
        </div>
      </header>

      <main className="register-main">
        <section className="register-hero">
          <div className="container">
            <div className="row g-4 align-items-center">
              <div className="col-lg-5">
                <div className="register-copy">
                  <span className="register-kicker">Care starts with calm organization</span>
                  <h1>Create your BabyBloom account</h1>
                  <p>
                    Set up a parent profile, keep your baby&apos;s care details ready, and
                    bring routines, reminders, and health notes into one peaceful space.
                  </p>

                  <div className="register-badges">
                    <span>Daily routine tracking</span>
                    <span>Doctor-ready health records</span>
                    <span>Vaccination reminders</span>
                  </div>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="register-shell" id="register-form">
                  <div className="row g-0">
                    <div className="col-xl-5">
                      <aside className="register-panel">
                        <span className="register-panel-label">Why parents choose us</span>
                        <h2>Everything important, right where you need it.</h2>
                        <ul className="register-benefits">
                          {supportHighlights.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>

                        <div className="register-stat-card">
                          <strong>Start in under 2 minutes</strong>
                          <p>
                            Create your profile now and organize your newborn care plan from
                            day one.
                          </p>
                        </div>
                      </aside>
                    </div>

                    <div className="col-xl-7">
                      <div className="register-form-card">
                        <div className="register-form-heading">
                          <span className="register-step">Step 1 of 1</span>
                          <h2>Parent registration</h2>
                          <p>Fill in your details to create a secure account.</p>
                        </div>

                        {submitted ? (
                          <div className="register-success" role="status">
                            <h3>Registration details captured</h3>
                            <p>
                              Welcome, {formData.fullName || 'Parent'}! Redirecting you to
                              your parent dashboard now.
                            </p>
                            <a className="btn btn-primary" href="/dashboard">
                              Open dashboard
                            </a>
                          </div>
                        ) : (
                          <form className="register-form" onSubmit={handleSubmit}>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label" htmlFor="fullName">
                                  Full name
                                </label>
                                <input
                                  className="form-control"
                                  id="fullName"
                                  name="fullName"
                                  type="text"
                                  placeholder="Aanya Patel"
                                  value={formData.fullName}
                                  onChange={handleChange}
                                  required
                                />
                              </div>

                              <div className="col-md-6">
                                <label className="form-label" htmlFor="email">
                                  Email address
                                </label>
                                <input
                                  className="form-control"
                                  id="email"
                                  name="email"
                                  type="email"
                                  placeholder="parent@email.com"
                                  value={formData.email}
                                  onChange={handleChange}
                                  required
                                />
                              </div>

                              <div className="col-md-6">
                                <label className="form-label" htmlFor="phone">
                                  Phone number
                                </label>
                                <input
                                  className="form-control"
                                  id="phone"
                                  name="phone"
                                  type="tel"
                                  placeholder="+91 98765 43210"
                                  value={formData.phone}
                                  onChange={handleChange}
                                  required
                                />
                              </div>

                              <div className="col-md-6">
                                <label className="form-label" htmlFor="babyDob">
                                  Baby&apos;s date of birth
                                </label>
                                <input
                                  className="form-control"
                                  id="babyDob"
                                  name="babyDob"
                                  type="date"
                                  value={formData.babyDob}
                                  onChange={handleChange}
                                  required
                                />
                              </div>

                              <div className="col-md-6">
                                <label className="form-label" htmlFor="role">
                                  Caregiver role
                                </label>
                                <select
                                  className="form-select"
                                  id="role"
                                  name="role"
                                  value={formData.role}
                                  onChange={handleChange}
                                >
                                  <option>Mother</option>
                                  <option>Father</option>
                                  <option>Guardian</option>
                                  <option>Grandparent</option>
                                </select>
                              </div>

                              <div className="col-md-6">
                                <label className="form-label" htmlFor="password">
                                  Password
                                </label>
                                <input
                                  className="form-control"
                                  id="password"
                                  name="password"
                                  type="password"
                                  placeholder="Create a password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  required
                                />
                              </div>

                              <div className="col-12">
                                <label className="form-label" htmlFor="confirmPassword">
                                  Confirm password
                                </label>
                                <input
                                  className="form-control"
                                  id="confirmPassword"
                                  name="confirmPassword"
                                  type="password"
                                  placeholder="Re-enter your password"
                                  value={formData.confirmPassword}
                                  onChange={handleChange}
                                  required
                                />
                              </div>

                              <div className="col-12">
                                <label className="register-check">
                                  <input
                                    name="agreeToTerms"
                                    type="checkbox"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                    required
                                  />
                                  <span>
                                    I agree to the Terms of Service and Privacy Policy.
                                  </span>
                                </label>
                              </div>

                              <div className="col-12">
                                <label className="register-check">
                                  <input
                                    name="subscribe"
                                    type="checkbox"
                                    checked={formData.subscribe}
                                    onChange={handleChange}
                                  />
                                  <span>
                                    Send me helpful newborn-care tips and reminder updates.
                                  </span>
                                </label>
                              </div>
                            </div>

                            <button className="btn btn-primary register-submit" type="submit">
                              Create my account
                            </button>

                            <p className="register-switch-copy">
                              Already have an account?{' '}
                              <a href="/login" onClick={handleLoginNavigation}>
                                Sign in
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

export default RegisterPage
