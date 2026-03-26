import React, { useEffect, useState } from 'react'
import '../components/style/parentdashboard.css'
import { getSavedBabyProfile } from '../utils/babyProfile'
import { deleteCareNote, getSavedCareNotes, saveCareNote } from '../utils/careNotes'
import { getLoggedInUser } from '../utils/navigation'

const noteCategories = ['Daily care', 'Feeding', 'Sleep', 'Health', 'Reminder']

const getTodayDate = () => {
  const today = new Date()
  const month = `${today.getMonth() + 1}`.padStart(2, '0')
  const day = `${today.getDate()}`.padStart(2, '0')

  return `${today.getFullYear()}-${month}-${day}`
}

const getBabyLabel = (familyType, index) =>
  familyType === 'twins' ? `Twin ${index === 0 ? 'A' : 'B'}` : 'Baby'

const hasProfileData = (profile = {}) => Object.values(profile).some(Boolean)

const formatNoteDate = (dateValue) => {
  if (!dateValue) {
    return 'No date added'
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const createInitialNoteForm = (firstTargetLabel = 'Family') => ({
  babyLabel: firstTargetLabel,
  category: noteCategories[0],
  noteDate: getTodayDate(),
  title: '',
  content: '',
})

const NotesSection = () => {
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'
  const savedProfile = getSavedBabyProfile(loggedInUser?.email)
  const familyType = savedProfile?.familyType === 'twins' ? 'twins' : 'single'
  const babies = savedProfile?.babies ?? []
  const availableBabies = babies.filter((profile) => hasProfileData(profile))
  const babyOptions = availableBabies.map((profile, index) => ({
    label: getBabyLabel(familyType, index),
    displayName: profile.name || getBabyLabel(familyType, index),
  }))
  const noteTargets = [{ label: 'Family', displayName: 'Family note' }, ...babyOptions]
  const [toastMessage, setToastMessage] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [noteForm, setNoteForm] = useState(() => createInitialNoteForm(noteTargets[0]?.label))
  const [savedNotes, setSavedNotes] = useState(() => getSavedCareNotes(loggedInUser?.email))

  useEffect(() => {
    if (!toastMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 2800)

    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  const handleNoteChange = (event) => {
    const { name, value } = event.target

    setNoteForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSaveNote = (event) => {
    event.preventDefault()

    const selectedTarget =
      noteTargets.find((target) => target.label === noteForm.babyLabel) ?? noteTargets[0]
    const existingNote = savedNotes.find((note) => note.id === editingNoteId)
    const nextNote = {
      id: editingNoteId ?? `${Date.now()}`,
      babyLabel: noteForm.babyLabel,
      babyName: selectedTarget?.displayName ?? noteForm.babyLabel,
      category: noteForm.category,
      noteDate: noteForm.noteDate,
      title: noteForm.title.trim(),
      content: noteForm.content.trim(),
      createdAt: existingNote?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const nextSavedNotes = saveCareNote(nextNote, loggedInUser?.email)
    setSavedNotes(nextSavedNotes)
    setEditingNoteId(null)
    setNoteForm(createInitialNoteForm(noteTargets[0]?.label))
    setToastMessage(existingNote ? 'Care note updated successfully.' : 'Care note saved successfully.')
  }

  const handleEditNote = (note) => {
    setEditingNoteId(note.id)
    setNoteForm({
      babyLabel: note.babyLabel,
      category: note.category,
      noteDate: note.noteDate || getTodayDate(),
      title: note.title,
      content: note.content,
    })
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setNoteForm(createInitialNoteForm(noteTargets[0]?.label))
  }

  const handleDeleteNote = (noteId) => {
    const nextSavedNotes = deleteCareNote(noteId, loggedInUser?.email)

    setSavedNotes(nextSavedNotes)

    if (editingNoteId === noteId) {
      handleCancelEdit()
    }

    setToastMessage('Care note removed.')
  }

  if (role !== 'parent') {
    return (
      <section className="dashboard-section-panel parent-dashboard-page">
        <div className="dashboard-section-intro">
          <span className="dashboard-section-label">{role} view</span>
          <h2 className="dashboard-section-title">Care Notes</h2>
          <p className="dashboard-section-copy">
            This note space is designed for parents to save daily observations and reminders.
          </p>
        </div>

        <div className="dashboard-section-card">
          <p className="mb-3">Sign in with a parent account to add or update care notes.</p>
          <p className="mb-0">Current account: {loggedInUser?.email || 'No email found'}</p>
        </div>
      </section>
    )
  }

  const latestNoteDate = savedNotes[0]?.noteDate ? formatNoteDate(savedNotes[0].noteDate) : 'No notes yet'
  const activeTargetsLabel =
    noteTargets.length === 1
      ? 'Family note space'
      : `${availableBabies.length} baby${availableBabies.length === 1 ? '' : 'ies'} plus family`

  return (
    <section className="dashboard-section-panel parent-dashboard-page notes-page">
      <div className="dashboard-section-intro">
        <span className="dashboard-section-label">Care Notes</span>
        <h2 className="dashboard-section-title">Keep reminders and observations together</h2>
        <p className="dashboard-section-copy mb-0">
          Save short daily updates, feeding notes, sleep observations, or reminders for the whole
          family in one place.
        </p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <article className="notes-summary-card h-100">
            <span className="dashboard-section-card-label">Saved notes</span>
            <h3>{savedNotes.length}</h3>
            <p className="mb-0">Each note stays linked to this parent account for quick review.</p>
          </article>
        </div>

        <div className="col-lg-4">
          <article className="notes-summary-card h-100">
            <span className="dashboard-section-card-label">Available targets</span>
            <h3>{activeTargetsLabel}</h3>
            <p className="mb-0">
              Add a family-wide reminder or attach a note to a saved baby profile.
            </p>
          </article>
        </div>

        <div className="col-lg-4">
          <article className="notes-summary-card h-100">
            <span className="dashboard-section-card-label">Latest note date</span>
            <h3>{latestNoteDate}</h3>
            <p className="mb-0">Use dated notes to keep appointments and daily care easier to trace.</p>
          </article>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
          <article className="notes-form-card h-100">
            <span className="dashboard-section-card-label">
              {editingNoteId ? 'Update note' : 'Add note'}
            </span>
            <h3 className="notes-form-title">
              {editingNoteId ? 'Edit the selected care note' : 'Save a new care note'}
            </h3>
            <p className="mb-4">
              Use short titles so it is easy to scan the list later.
            </p>

            <form onSubmit={handleSaveNote}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="babyLabel">
                    Note for
                  </label>
                  <select
                    className="form-select"
                    id="babyLabel"
                    name="babyLabel"
                    value={noteForm.babyLabel}
                    onChange={handleNoteChange}
                  >
                    {noteTargets.map((target) => (
                      <option key={target.label} value={target.label}>
                        {target.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="category">
                    Category
                  </label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={noteForm.category}
                    onChange={handleNoteChange}
                  >
                    {noteCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="noteDate">
                    Note date
                  </label>
                  <input
                    className="form-control"
                    id="noteDate"
                    name="noteDate"
                    type="date"
                    value={noteForm.noteDate}
                    onChange={handleNoteChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="title">
                    Title
                  </label>
                  <input
                    className="form-control"
                    id="title"
                    name="title"
                    type="text"
                    value={noteForm.title}
                    onChange={handleNoteChange}
                    placeholder="Example: Night feeding update"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="content">
                    Note details
                  </label>
                  <textarea
                    className="form-control"
                    id="content"
                    name="content"
                    rows="5"
                    value={noteForm.content}
                    onChange={handleNoteChange}
                    placeholder="Add the observation, reminder, medicine note, or question to remember."
                    required
                  />
                </div>

                <div className="col-12">
                  <div className="d-flex flex-wrap gap-3">
                    <button className="btn btn-primary" type="submit">
                      {editingNoteId ? 'Update Note' : 'Save Note'}
                    </button>
                    {editingNoteId && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </article>
        </div>

        <div className="col-xl-7">
          <article className="notes-log-card h-100">
            <div className="notes-log-header">
              <div>
                <span className="dashboard-section-card-label">Saved list</span>
                <h3>Recent care notes</h3>
              </div>
              {savedNotes.length > 0 && <span className="dashboard-save-badge">Updated</span>}
            </div>

            {savedNotes.length ? (
              <div className="notes-log-list">
                {savedNotes.map((note) => (
                  <article className="notes-entry-card" key={note.id}>
                    <div className="notes-entry-header">
                      <div>
                        <span className="dashboard-section-card-label">{note.babyName}</span>
                        <h4>{note.title}</h4>
                      </div>
                      <span className="notes-category-badge">{note.category}</span>
                    </div>

                    <div className="notes-log-meta">
                      <span>{formatNoteDate(note.noteDate)}</span>
                      <span>{note.babyLabel === 'Family' ? 'Family note' : note.babyLabel}</span>
                    </div>

                    <p className="mb-3">{note.content}</p>

                    <div className="notes-action-row">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        type="button"
                        onClick={() => handleEditNote(note)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="dashboard-profile-empty-state">
                No care notes saved yet. Add the first note to keep a reminder or observation here.
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

export default NotesSection
