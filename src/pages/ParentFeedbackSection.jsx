import React, { useEffect, useMemo, useState } from 'react'
import '../components/style/parentdashboard.css'
import { getLoggedInUser } from '../utils/navigation'
import { getFeedbackEntries, saveFeedbackEntry } from '../utils/feedback'

const initialForm = {
  feedback: '',
  rating: '5',
}

const getDisplayName = (user) => {
  const email = user?.email ?? ''
  if (!email.includes('@')) {
    return 'Parent user'
  }

  const localPart = email.split('@')[0]
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const ParentFeedbackSection = () => {
  const loggedInUser = getLoggedInUser()
  const [form, setForm] = useState(initialForm)
  const [toastMessage, setToastMessage] = useState('')
  const feedbackEntries = getFeedbackEntries()

  const myFeedback = useMemo(
    () =>
      feedbackEntries.filter(
        (entry) =>
          entry.channel === 'Parent dashboard' &&
          entry.name.toLowerCase() === getDisplayName(loggedInUser).toLowerCase()
      ),
    [feedbackEntries, loggedInUser]
  )

  useEffect(() => {
    if (!toastMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 2800)

    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    saveFeedbackEntry({
      name: getDisplayName(loggedInUser),
      feedback: form.feedback.trim(),
      rating: Number(form.rating),
      channel: 'Parent dashboard',
      visibility: 'private',
    })

    setForm(initialForm)
    setToastMessage('Thank you. Your feedback has been sent privately to the BabyBloom team.')
  }

  return (
    <section className="dashboard-section-panel parent-dashboard-page">
      <div className="dashboard-overview-hero mb-4">
        <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
          <div>
            <span className="dashboard-section-card-label">Parent feedback</span>
            <h2 className="h3 mt-2 mb-3">Share your BabyBloom experience</h2>
            <p className="mb-0 text-muted">
              Tell us what is working well, what feels unclear, and what would help your family most.
            </p>
          </div>

          <div className="dashboard-overview-status" aria-label="Feedback summary">
            <span className="dashboard-save-badge">{myFeedback.length} submitted</span>
            <p className="mb-0">Your feedback is shared privately with the BabyBloom team.</p>
            <p className="mb-0">Signed in as {loggedInUser?.email || 'parent account'}.</p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
          <article className="dashboard-twin-summary-card h-100">
            <span className="dashboard-section-card-label">New feedback</span>
            <h3 className="h5 mt-2 mb-3">Write a quick review</h3>
            <p className="mb-4 text-muted">
              Keep it short and specific. This goes to admin as private product feedback.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label" htmlFor="feedback-rating">
                    Rating
                  </label>
                  <select
                    className="form-select"
                    id="feedback-rating"
                    name="rating"
                    value={form.rating}
                    onChange={handleChange}
                  >
                    <option value="5">5 stars</option>
                    <option value="4">4 stars</option>
                    <option value="3">3 stars</option>
                    <option value="2">2 stars</option>
                    <option value="1">1 star</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="feedback-message">
                    Your feedback
                  </label>
                  <textarea
                    className="form-control"
                    id="feedback-message"
                    name="feedback"
                    rows="6"
                    value={form.feedback}
                    onChange={handleChange}
                    placeholder="What has been most helpful for your family so far?"
                    required
                  />
                </div>

                <div className="col-12">
                  <button className="btn btn-primary" type="submit" disabled={!form.feedback.trim()}>
                    Submit Feedback
                  </button>
                </div>
              </div>
            </form>
          </article>
        </div>

        <div className="col-xl-7">
          <article className="dashboard-twin-summary-card h-100">
            <div className="admin-section-header">
              <div>
                <span className="dashboard-section-card-label">Your recent entries</span>
                <h3 className="h5 mt-2 mb-1">Feedback from this parent account</h3>
                <p className="dashboard-inline-hint mb-0">
                  Recent submissions help you keep track of what you already shared.
                </p>
              </div>
              <span className="dashboard-save-badge">{myFeedback.length} entries</span>
            </div>

            {myFeedback.length ? (
              <div className="admin-record-list">
                {myFeedback.map((entry) => (
                  <article className="admin-record-card" key={entry.id}>
                    <div className="admin-record-main">
                      <div className="admin-record-title-row">
                        <div>
                          <span className="dashboard-section-card-label">{entry.channel}</span>
                          <h4>{entry.name}</h4>
                        </div>
                        <span className="growth-chip">{entry.rating}/5</span>
                      </div>
                      <p className="admin-record-copy mb-0">{entry.feedback}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="dashboard-profile-empty-state">
                No feedback submitted yet. Share one short review to test the new parent feedback flow.
              </div>
            )}
          </article>
        </div>
      </div>

      {toastMessage && (
        <div className="dashboard-toast" role="status" aria-live="polite">
          <strong>Saved</strong>
          <p className="mb-0">{toastMessage}</p>
        </div>
      )}
    </section>
  )
}

export default ParentFeedbackSection
