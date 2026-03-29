import React, { useEffect, useState } from 'react'
import '../components/style/parentdashboard.css'
import {
  convertFeedbackToTestimonial,
  deleteFeedbackEntry,
  getFeedbackEntries,
  saveFeedbackReply,
  setFeedbackHomepageApproval,
} from '../utils/feedback'
import { getContactMessages, saveContactReply, resolveContactMessage } from '../utils/contactMessages'

const createReplyDrafts = (entries) =>
  entries.reduce((drafts, entry) => {
    drafts[entry.id] = entry.reply?.message ?? ''
    return drafts
  }, {})

const AdminFeedbackSection = () => {
  const [feedbackEntries, setFeedbackEntries] = useState(() => getFeedbackEntries())
  const [replyDrafts, setReplyDrafts] = useState(() => createReplyDrafts(getFeedbackEntries()))
  const [contactMessages, setContactMessages] = useState(() => getContactMessages())
  const [contactReplyDrafts, setContactReplyDrafts] = useState(() => createReplyDrafts(getContactMessages()))
  const [toastMessage, setToastMessage] = useState('')
  const [feedbackSearch, setFeedbackSearch] = useState('')
  const [contactSearch, setContactSearch] = useState('')
  const [activeInbox, setActiveInbox] = useState('feedback')

  const repliedCount = feedbackEntries.filter((entry) => entry.reply).length
  const repliedContactCount = contactMessages.filter((entry) => entry.reply).length
  const privateFeedbackCount = feedbackEntries.filter((entry) => entry.isPrivate).length
  const homepageApprovedCount = feedbackEntries.filter((entry) => entry.isHomepageApproved).length
  const averageFeedbackRating = feedbackEntries.length
    ? (feedbackEntries.reduce((total, entry) => total + entry.rating, 0) / feedbackEntries.length).toFixed(1)
    : '0.0'

  const filteredFeedback = feedbackEntries.filter((entry) => {
    const query = feedbackSearch.toLowerCase()
    return (
      entry.name.toLowerCase().includes(query) ||
      entry.feedback.toLowerCase().includes(query) ||
      entry.channel.toLowerCase().includes(query)
    )
  })

  const filteredContacts = contactMessages.filter((entry) => {
    const query = contactSearch.toLowerCase()
    return (
      entry.name.toLowerCase().includes(query) ||
      entry.email.toLowerCase().includes(query) ||
      entry.message.toLowerCase().includes(query)
    )
  })

  useEffect(() => {
    if (!toastMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 2800)

    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  const refreshFeedbackEntries = () => {
    const nextEntries = getFeedbackEntries()
    setFeedbackEntries(nextEntries)
    setReplyDrafts(createReplyDrafts(nextEntries))
    return nextEntries
  }

  const handleReplyChange = (feedbackId, value) => {
    setReplyDrafts((current) => ({
      ...current,
      [feedbackId]: value,
    }))
  }

  const handleSaveReply = (feedbackId) => {
    const nextMessage = replyDrafts[feedbackId]?.trim()

    if (!nextMessage) {
      return
    }

    const nextEntries = saveFeedbackReply(feedbackId, nextMessage)
    setFeedbackEntries(nextEntries)
    setReplyDrafts(createReplyDrafts(nextEntries))
    setToastMessage('Feedback reply saved to local storage.')
  }

  const handleSetHomepageApproval = (feedbackId, isApproved) => {
    const nextEntries = setFeedbackHomepageApproval(feedbackId, isApproved)
    setFeedbackEntries(nextEntries)
    setReplyDrafts(createReplyDrafts(nextEntries))
    setToastMessage(
      isApproved
        ? 'Feedback approved for the homepage testimonial section.'
        : 'Feedback removed from the homepage testimonial section.'
    )
  }

  const handleDeleteFeedback = (feedbackId) => {
    if (
      window.confirm(
        'Are you sure you want to remove this feedback entry? This action cannot be undone.'
      )
    ) {
      const nextEntries = deleteFeedbackEntry(feedbackId)
      setFeedbackEntries(nextEntries)
      setReplyDrafts(createReplyDrafts(nextEntries))
      setToastMessage('Feedback entry removed from the shared testimonial library.')
    }
  }

  const handleConvertToTestimonial = (feedbackId) => {
    const nextEntries = convertFeedbackToTestimonial(feedbackId)
    setFeedbackEntries(nextEntries)
    setReplyDrafts(createReplyDrafts(nextEntries))
    setActiveInbox('feedback')
    setToastMessage('Private feedback converted into a public testimonial and approved for homepage.')
  }

  const handleContactReplyChange = (messageId, value) => {
    setContactReplyDrafts((current) => ({
      ...current,
      [messageId]: value,
    }))
  }

  const handleSaveContactReply = (messageId) => {
    const nextMessage = contactReplyDrafts[messageId]?.trim()

    if (!nextMessage) {
      return
    }

    const nextMessages = saveContactReply(messageId, nextMessage)
    setContactMessages(nextMessages)
    setContactReplyDrafts(createReplyDrafts(nextMessages))
    setToastMessage('Contact reply saved to local storage.')
  }

  const handleResolveContact = (messageId) => {
    const nextMessages = resolveContactMessage(messageId)
    setContactMessages(nextMessages)
    setContactReplyDrafts(createReplyDrafts(nextMessages))
    setToastMessage('Contact message marked as resolved and removed from inbox.')
  }

  const renderFeedbackPanel = () => (
    <>
      <div className="admin-toolbar">
        <input
          className="form-control admin-search-input"
          type="search"
          placeholder="Search by parent name, source, or feedback"
          value={feedbackSearch}
          onChange={(event) => setFeedbackSearch(event.target.value)}
        />
      </div>

      <div className="admin-summary-strip">
        <div className="admin-summary-pill">
          <strong>{feedbackEntries.length}</strong>
          <span>Total feedback</span>
        </div>
        <div className="admin-summary-pill">
          <strong>{repliedCount}</strong>
          <span>Replied</span>
        </div>
        <div className="admin-summary-pill">
          <strong>{homepageApprovedCount}</strong>
          <span>Homepage approved</span>
        </div>
      </div>

      {filteredFeedback.length ? (
        <div className="row g-3">
          {filteredFeedback.map((item) => (
            <div className="col-lg-6" key={item.id}>
              <article className="admin-record-card h-100">
                <div className="admin-record-main">
                  <div className="admin-record-title-row">
                    <div>
                      <span className="dashboard-section-card-label">{item.channel}</span>
                      <h4>{item.name}</h4>
                    </div>
                    <span className="growth-chip">{item.rating}/5</span>
                  </div>

                  <div className="admin-meta-row">
                    <span>{item.isPrivate ? 'Private admin feedback' : 'Public testimonial candidate'}</span>
                    <span>{item.isHomepageApproved ? 'Approved for homepage' : 'Not on homepage'}</span>
                  </div>

                  <p className="mb-3 admin-record-copy">{item.feedback}</p>

                  {item.reply && (
                    <div className="dashboard-profile-mini-card mb-3">
                      <span className="dashboard-section-card-label">Saved admin reply</span>
                      <p className="mb-2 mt-2">{item.reply.message}</p>
                      <p className="dashboard-inline-hint mb-0">
                        Updated {new Date(item.reply.updatedAt).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  )}

                  <label className="form-label" htmlFor={`reply-${item.id}`}>
                    {item.reply ? 'Edit reply' : 'Reply to feedback'}
                  </label>
                  <textarea
                    className="form-control mb-3"
                    id={`reply-${item.id}`}
                    rows="4"
                    value={replyDrafts[item.id] ?? ''}
                    onChange={(event) => handleReplyChange(item.id, event.target.value)}
                    placeholder="Write a helpful admin reply."
                  />
                </div>

                <div className="admin-record-actions">
                  {item.isPrivate && (
                    <button
                      className="btn btn-outline-primary btn-sm"
                        type="button"
                        onClick={() => handleConvertToTestimonial(item.id)}
                      >
                        Convert to Testimonial
                      </button>
                    )}
                    <button
                      className="btn btn-primary btn-sm"
                      type="button"
                      onClick={() => handleSaveReply(item.id)}
                      disabled={!replyDrafts[item.id]?.trim()}
                  >
                    {item.reply ? 'Update Reply' : 'Save Reply'}
                  </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      type="button"
                      onClick={() => handleDeleteFeedback(item.id)}
                    >
                      Remove Entry
                    </button>
                  {!item.isPrivate && (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      type="button"
                      onClick={() => handleSetHomepageApproval(item.id, !item.isHomepageApproved)}
                    >
                      {item.isHomepageApproved ? 'Remove from Homepage' : 'Approve for Homepage'}
                    </button>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>
      ) : (
        <div className="dashboard-profile-empty-state">
          No feedback entries match the current search.
        </div>
      )}
    </>
  )

  const renderContactPanel = () => (
    <>
      <div className="admin-toolbar">
        <input
          className="form-control admin-search-input"
          type="search"
          placeholder="Search by sender, email, or message"
          value={contactSearch}
          onChange={(event) => setContactSearch(event.target.value)}
        />
      </div>

      <div className="admin-summary-strip">
        <div className="admin-summary-pill">
          <strong>{contactMessages.length}</strong>
          <span>Total messages</span>
        </div>
        <div className="admin-summary-pill">
          <strong>{repliedContactCount}</strong>
          <span>Replied</span>
        </div>
        <div className="admin-summary-pill">
          <strong>{contactMessages.filter((item) => !item.reply).length}</strong>
          <span>Awaiting reply</span>
        </div>
      </div>

      {filteredContacts.length ? (
        <div className="row g-3">
          {filteredContacts.map((item) => (
            <div className="col-lg-6" key={item.id}>
              <article className="admin-record-card h-100">
                <div className="admin-record-main">
                  <div className="admin-record-title-row">
                    <div>
                      <span className="dashboard-section-card-label">{item.channel}</span>
                      <h4>{item.name}</h4>
                    </div>
                    <span className="growth-chip">{item.email}</span>
                  </div>

                  <p className="mb-3 admin-record-copy">{item.message}</p>

                  <p className="dashboard-inline-hint mb-3">
                    Submitted {new Date(item.submittedAt).toLocaleString('en-US')}
                  </p>

                  {item.reply && (
                    <div className="dashboard-profile-mini-card mb-3">
                      <span className="dashboard-section-card-label">Saved admin reply</span>
                      <p className="mb-2 mt-2">{item.reply.message}</p>
                      <p className="dashboard-inline-hint mb-0">
                        Updated {new Date(item.reply.updatedAt).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  )}

                  <label className="form-label" htmlFor={`contact-reply-${item.id}`}>
                    {item.reply ? 'Edit reply' : 'Reply to message'}
                  </label>
                  <textarea
                    className="form-control mb-3"
                    id={`contact-reply-${item.id}`}
                    rows="4"
                    value={contactReplyDrafts[item.id] ?? ''}
                    onChange={(event) => handleContactReplyChange(item.id, event.target.value)}
                    placeholder="Write a helpful admin reply."
                  />
                </div>

                <div className="admin-record-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    onClick={() => handleSaveContactReply(item.id)}
                    disabled={!contactReplyDrafts[item.id]?.trim()}
                  >
                    {item.reply ? 'Update Reply' : 'Save Reply'}
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    type="button"
                    onClick={() => handleResolveContact(item.id)}
                  >
                    Mark Resolved
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>
      ) : (
        <div className="dashboard-profile-empty-state">
          No contact messages match the current search.
        </div>
      )}
    </>
  )

  return (
    <section className="dashboard-section-panel parent-dashboard-page">
      <div className="dashboard-overview-hero mb-4">
        <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
          <div>
            <span className="dashboard-section-card-label">Feedback management</span>
            <h2 className="h3 mt-2 mb-3">User feedback and admin replies</h2>
            <p className="mb-0 text-muted">
              Review feedback from parents and contact form submissions, then save a local admin reply for each entry.
            </p>
          </div>

          <div className="dashboard-overview-status" aria-label="Feedback summary">
            <span className="dashboard-save-badge">{feedbackEntries.length + contactMessages.length} inbox items</span>
            <p className="mb-0">
              {repliedCount + repliedContactCount} replied conversation{repliedCount + repliedContactCount === 1 ? '' : 's'} saved.
            </p>
            <p className="mb-0">Average rating is {averageFeedbackRating} across the feedback feed.</p>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-4">
          <article className="dashboard-section-card h-100">
            <span className="dashboard-section-card-label">Feedback entries</span>
            <h3>{feedbackEntries.length}</h3>
            <p className="mb-0">{privateFeedbackCount} private entries and {homepageApprovedCount} homepage-approved testimonials.</p>
          </article>
        </div>
        <div className="col-md-6 col-xl-4">
          <article className="dashboard-section-card h-100">
            <span className="dashboard-section-card-label">Replies saved</span>
            <h3>{repliedCount + repliedContactCount}</h3>
            <p className="mb-0">Feedback and contact entries with an admin response stored in local storage.</p>
          </article>
        </div>
        <div className="col-md-6 col-xl-4">
          <article className="dashboard-section-card h-100">
            <span className="dashboard-section-card-label">Contact inbox</span>
            <h3>{contactMessages.length}</h3>
            <p className="mb-0">Messages submitted from the public contact form and ready for admin review.</p>
          </article>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <article className="dashboard-twin-summary-card h-100">
            <div className="admin-section-header">
              <div>
                <span className="dashboard-section-card-label">Inbox workspace</span>
                <h3 className="h5 mt-2 mb-1">Review and respond</h3>
                <p className="dashboard-inline-hint mb-0">
                  Private parent feedback stays internal. Convert strong entries into approved public testimonials when needed.
                </p>
              </div>
              <span className="dashboard-save-badge">
                {activeInbox === 'feedback'
                  ? `${filteredFeedback.length} of ${feedbackEntries.length}`
                  : `${filteredContacts.length} of ${contactMessages.length}`}
              </span>
            </div>

            <div className="admin-segmented-control" role="tablist" aria-label="Inbox sections">
              <button
                className={`admin-segment-button${activeInbox === 'feedback' ? ' is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={activeInbox === 'feedback'}
                onClick={() => setActiveInbox('feedback')}
              >
                Feedback
                <span className="admin-segment-count">{feedbackEntries.length}</span>
              </button>
              <button
                className={`admin-segment-button${activeInbox === 'contact' ? ' is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={activeInbox === 'contact'}
                onClick={() => setActiveInbox('contact')}
              >
                Contact
                <span className="admin-segment-count">{contactMessages.length}</span>
              </button>
            </div>

            <div className="admin-inbox-panel">
              {activeInbox === 'feedback' ? renderFeedbackPanel() : renderContactPanel()}
            </div>
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

export default AdminFeedbackSection
