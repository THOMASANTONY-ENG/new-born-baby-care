import React, { useState } from 'react'
import './style/contact.css'
import { saveContactMessage } from '../utils/contactMessages'

const emptyForm = {
  name: '',
  email: '',
  message: '',
}

const ContactSection = () => {
  const [form, setForm] = useState(emptyForm)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Name is required.'
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!form.message.trim()) nextErrors.message = 'Message is required.'
    return nextErrors
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }))
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    saveContactMessage(form)

    setForm(emptyForm)
    setErrors({})
    setSubmitted(true)
    window.setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="contact-inner">
          <div className="contact-copy">
            <span className="section-kicker">Get in touch</span>
            <h2 className="contact-heading">We&apos;re here to help</h2>
            <p className="contact-subtext">
              Have a question about BabyBloom? Want to suggest a feature or report an issue? Drop us
              a message and the team will get back to you within one business day.
            </p>

            <ul className="contact-details">
              <li>
                <span className="contact-detail-icon">✉</span>
                <span>support@babybloom.com</span>
              </li>
              <li>
                <span className="contact-detail-icon">🕐</span>
                <span>Mon – Sat, 9:00 AM to 7:00 PM</span>
              </li>
              <li>
                <span className="contact-detail-icon">📍</span>
                <span>Serving families across India</span>
              </li>
            </ul>
          </div>

          <div className="contact-card">
            <span className="contact-card-kicker">Send a message</span>
            <h3 className="contact-card-title">Contact us</h3>

            {submitted && (
              <div className="contact-success" role="status" aria-live="polite">
                <span className="contact-success-icon">✓</span>
                <div>
                  <strong>Message sent!</strong>
                  <p className="mb-0">
                    Thank you for reaching out. We&apos;ll get back to you shortly.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="contact-field">
                <label htmlFor="contact-name" className="contact-label">
                  Your name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  className={`contact-input${errors.name ? ' contact-input--error' : ''}`}
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
                {errors.name && <span className="contact-error">{errors.name}</span>}
              </div>

              <div className="contact-field">
                <label htmlFor="contact-email" className="contact-label">
                  Email address
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  className={`contact-input${errors.email ? ' contact-input--error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <span className="contact-error">{errors.email}</span>}
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message" className="contact-label">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  className={`contact-input contact-textarea${errors.message ? ' contact-input--error' : ''}`}
                  placeholder="Tell us what you need help with..."
                  value={form.message}
                  onChange={handleChange}
                />
                {errors.message && <span className="contact-error">{errors.message}</span>}
              </div>

              <button type="submit" className="contact-submit">
                Send message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
