import React, { useEffect, useState } from 'react'
import '../components/style/parentdashboard.css'
import { defaultDoctorImage } from '../data/doctors'
import {
  deleteDoctor,
  doctorEmailExists,
  getAvailableDoctors,
  getSavedDoctors,
  saveDoctor,
} from '../utils/doctors'

const initialDoctorForm = {
  id: '',
  name: '',
  email: '',
  password: '',
  specialty: 'Pediatrician',
  rating: '4.8',
  image: '',
  slots: {},
}

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.readAsDataURL(file)
  })

const AdminDoctorsSection = () => {
  const [doctorForm, setDoctorForm] = useState(initialDoctorForm)
  const [savedDoctors, setSavedDoctors] = useState(() => getSavedDoctors())
  const [toastMessage, setToastMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [profileFilter, setProfileFilter] = useState('all')
  const [confirmDeleteDoctorId, setConfirmDeleteDoctorId] = useState(null)
  const [currentSlotTime, setCurrentSlotTime] = useState('')
  const DAYS_OF_WEEK = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' },
  ]
  const [selectedDays, setSelectedDays] = useState(['monday'])
  const [timeInputMode, setTimeInputMode] = useState('single') // 'single' or 'range'
  const [rangeStart, setRangeStart] = useState('09:00')
  const [rangeEnd, setRangeEnd] = useState('17:00')
  const allDoctors = getAvailableDoctors()
  const filteredDoctors = allDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      profileFilter === 'all' ||
      (profileFilter === 'editable' && doctor.source === 'custom') ||
      (profileFilter === 'preloaded' && doctor.source !== 'custom')

    return matchesSearch && matchesFilter
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

  const handleDoctorChange = (event) => {
    const { name, value } = event.target

    setDoctorForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleDoctorImageChange = async (event) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    if (!selectedFile.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file for the doctor photo.')
      event.target.value = ''
      return
    }

    try {
      const imageDataUrl = await readFileAsDataUrl(selectedFile)
      setDoctorForm((current) => ({
        ...current,
        image: imageDataUrl,
      }))
      setErrorMessage('')
    } catch {
      setErrorMessage('Unable to read the uploaded photo. Please try another image.')
    }

    event.target.value = ''
  }

  const resetDoctorForm = () => {
    setDoctorForm(initialDoctorForm)
    setCurrentSlotTime('')
    setErrorMessage('')
  }

  const handleSaveDoctor = (event) => {
    event.preventDefault()

    const normalizedEmail = doctorForm.email.trim().toLowerCase()

    if (doctorEmailExists(normalizedEmail, doctorForm.id)) {
      setErrorMessage('A doctor with this email already exists.')
      return
    }

    const nextSavedDoctors = saveDoctor({
      id: doctorForm.id || undefined,
      name: doctorForm.name.trim(),
      email: normalizedEmail,
      password: doctorForm.password,
      specialty: doctorForm.specialty.trim(),
      rating: doctorForm.rating,
      image: doctorForm.image.trim(),
      slots: doctorForm.slots,
    })

    setSavedDoctors(nextSavedDoctors)
    resetDoctorForm()
    setToastMessage(
      doctorForm.id
        ? 'Doctor profile updated successfully.'
        : 'Doctor profile created and ready for login.'
    )
  }

  const handleEditDoctor = (doctor) => {
    setDoctorForm({
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      password: doctor.password ?? '',
      specialty: doctor.specialty,
      rating: doctor.rating.toString(),
      image: doctor.image === defaultDoctorImage ? '' : doctor.image,
      slots: doctor.slots || {},
    })
    setErrorMessage('')
  }

  const handleToggleDay = (dayId) => {
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.length > 1
          ? prev.filter((d) => d !== dayId)
          : prev
        : [...prev, dayId]
    )
  }

  const handleSelectPreset = (preset) => {
    if (preset === 'all') setSelectedDays(DAYS_OF_WEEK.map((d) => d.id))
    else if (preset === 'weekdays') setSelectedDays(DAYS_OF_WEEK.slice(0, 5).map((d) => d.id))
    else if (preset === 'weekend') setSelectedDays(DAYS_OF_WEEK.slice(5).map((d) => d.id))
  }

  const handleAddSlot = () => {
    if (!currentSlotTime) {
      setErrorMessage('Please select a time to add a slot.')
      return
    }

    const formatTime12 = (value) => {
      const [h, m] = value.split(':')
      const hour = parseInt(h, 10)
      const period = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 || 12
      return `${hour12}:${m} ${period}`
    }

    const formattedTime = formatTime12(currentSlotTime)
    const duplicateDays = selectedDays.filter((day) =>
      (doctorForm.slots[day] || []).includes(formattedTime)
    )

    if (duplicateDays.length > 0) {
      setErrorMessage(`This time slot already exists for: ${duplicateDays.join(', ')}`)
      return
    }

    setDoctorForm((current) => {
      const nextSlots = { ...current.slots }

      selectedDays.forEach((day) => {
        const daySlots = nextSlots[day] || []
        nextSlots[day] = [...daySlots, formattedTime].sort((a, b) => {
          const parse = (s) => {
            const [time, period] = s.split(' ')
            let [hh, mm] = time.split(':').map(Number)
            if (period === 'PM' && hh !== 12) hh += 12
            if (period === 'AM' && hh === 12) hh = 0
            return hh * 60 + mm
          }
          return parse(a) - parse(b)
        })
      })

      return {
        ...current,
        slots: nextSlots,
      }
    })

    setCurrentSlotTime('')
    setErrorMessage('')
  }

  const handleGenerateRangeSlots = () => {
    const formatTime12 = (value) => {
      const [h, m] = value.split(':')
      const hour = parseInt(h, 10)
      const period = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 || 12
      return `${hour12}:${m} ${period}`
    }

    const start = rangeStart.split(':').map(Number)
    const end = rangeEnd.split(':').map(Number)
    const interval = 30 // Professional default 30-minute interval

    let current = start[0] * 60 + start[1]
    const endTime = end[0] * 60 + end[1]

    if (endTime <= current) {
      setErrorMessage('Shift end time must be after start time.')
      return
    }

    const newSlots = []
    while (current <= endTime) {
      const hh = Math.floor(current / 60)
      const mm = current % 60
      const timeString = `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`
      newSlots.push(formatTime12(timeString))
      current += interval
    }

    setDoctorForm((prev) => {
      const nextSlots = { ...prev.slots }
      selectedDays.forEach((day) => {
        const daySlots = [...(nextSlots[day] || [])]
        newSlots.forEach((slot) => {
          if (!daySlots.includes(slot)) {
            daySlots.push(slot)
          }
        })
        nextSlots[day] = daySlots.sort((a, b) => {
          const parse = (s) => {
            const [time, period] = s.split(' ')
            let [hh, mm] = time.split(':').map(Number)
            if (period === 'PM' && hh !== 12) hh += 12
            if (period === 'AM' && hh === 12) hh = 0
            return hh * 60 + mm
          }
          return parse(a) - parse(b)
        })
      })
      return { ...prev, slots: nextSlots }
    })
    setToastMessage(`Generated ${newSlots.length} full shift slots for ${selectedDays.length} days.`)
    setErrorMessage('')
  }

  const handleClearSelectedDays = () => {
    if (window.confirm(`Are you sure you want to clear all slots for: ${selectedDays.join(', ')}?`)) {
      setDoctorForm((prev) => {
        const nextSlots = { ...prev.slots }
        selectedDays.forEach((day) => {
          delete nextSlots[day]
        })
        return { ...prev, slots: nextSlots }
      })
      setToastMessage(`Cleared slots for selected days.`)
    }
  }

  const handleRemoveSlot = (day, time) => {
    setDoctorForm((current) => {
      const daySlots = (current.slots[day] || []).filter((s) => s !== time)
      const nextSlots = { ...current.slots }

      if (daySlots.length > 0) {
        nextSlots[day] = daySlots
      } else {
        delete nextSlots[day]
      }

      return {
        ...current,
        slots: nextSlots,
      }
    })
  }

  const handleDeleteDoctor = (doctorId) => {
    const nextSavedDoctors = deleteDoctor(doctorId)
    setSavedDoctors(nextSavedDoctors)

    if (doctorForm.id === doctorId) {
      resetDoctorForm()
    }

    setConfirmDeleteDoctorId(null)
    setToastMessage('Doctor profile removed from local storage.')
  }

  return (
    <section className="dashboard-section-panel parent-dashboard-page">
      <div className="dashboard-overview-hero mb-4">
        <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
          <div>
            <span className="dashboard-section-card-label">Pediatrician management</span>
            <h2 className="h3 mt-2 mb-3">Admin doctor directory</h2>
            <p className="mb-0 text-muted">
              Create doctor accounts with full profile details, login credentials, and profile
              images.
            </p>
          </div>

          <div className="dashboard-overview-status" aria-label="Doctor management summary">
            <span className="dashboard-save-badge">{allDoctors.length} profiles</span>
            <p className="mb-0">Available doctors appear in bookings and the homepage list.</p>
            <p className="mb-0">Doctors sign in with the exact email and password entered here.</p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
          <article className="dashboard-twin-summary-card h-100">
            <span className="dashboard-section-card-label">Create profile</span>
            <h3 className="h5 mt-2 mb-3">
              {doctorForm.id ? 'Edit doctor account' : 'Add a doctor account'}
            </h3>
            <p className="mb-4 text-muted">
              Save the doctor details once and the same record will be used in login and doctor
              selection lists.
            </p>

            {errorMessage && (
              <div className="alert alert-danger py-2" role="alert">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveDoctor}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="doctorName">
                    Doctor name
                  </label>
                  <input
                    className="form-control"
                    id="doctorName"
                    name="name"
                    type="text"
                    value={doctorForm.name}
                    onChange={handleDoctorChange}
                    placeholder="Dr. Maya Nair"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="doctorEmail">
                    Doctor email
                  </label>
                  <input
                    className="form-control"
                    id="doctorEmail"
                    name="email"
                    type="email"
                    value={doctorForm.email}
                    onChange={handleDoctorChange}
                    placeholder="dr.maya@babybloom.com"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="doctorPassword">
                    Doctor password
                  </label>
                  <input
                    className="form-control"
                    id="doctorPassword"
                    name="password"
                    type="text"
                    value={doctorForm.password}
                    onChange={handleDoctorChange}
                    placeholder="Enter doctor login password"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="doctorImage">
                    Upload doctor photo
                  </label>
                  <input
                    className="form-control"
                    id="doctorImage"
                    type="file"
                    accept="image/*"
                    onChange={handleDoctorImageChange}
                  />
                  <p className="form-text mb-0">
                    Upload a photo from your device. Leave it empty to use the default doctor
                    image.
                  </p>
                </div>

                <div className="col-md-7">
                  <label className="form-label" htmlFor="doctorSpecialty">
                    Specialty
                  </label>
                  <input
                    className="form-control"
                    id="doctorSpecialty"
                    name="specialty"
                    type="text"
                    value={doctorForm.specialty}
                    onChange={handleDoctorChange}
                    placeholder="Pediatrician"
                    required
                  />
                </div>

                <div className="col-md-5">
                  <label className="form-label" htmlFor="doctorRating">
                    Rating
                  </label>
                  <input
                    className="form-control"
                    id="doctorRating"
                    name="rating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={doctorForm.rating}
                    onChange={handleDoctorChange}
                    required
                  />
                </div>

                <div className="col-12 mt-4">
                  <span className="dashboard-section-card-label mb-2 d-block">
                    Select days and time slot
                  </span>
                  <div className="admin-day-selector-grid mb-3">
                    {DAYS_OF_WEEK.map((day) => {
                      const isActive = selectedDays.includes(day.id)
                      return (
                        <button
                          key={day.id}
                          type="button"
                          className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}
                          style={{
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            minWidth: '42px',
                            transition: 'all 0.2s',
                          }}
                          onClick={() => handleToggleDay(day.id)}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none small fw-bold"
                      onClick={() => handleSelectPreset('all')}
                    >
                      + Daily
                    </button>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none small fw-bold"
                      onClick={() => handleSelectPreset('weekdays')}
                    >
                      + Weekdays
                    </button>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none small fw-bold"
                      onClick={() => handleSelectPreset('weekend')}
                    >
                      + Weekend
                    </button>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none small fw-bold text-danger ms-auto"
                      onClick={() => setSelectedDays(['monday'])}
                    >
                      Reset
                    </button>
                  </div>

                  <div className="btn-group w-100 mb-4" role="group">
                    <button
                      type="button"
                      className={`btn btn-sm ${timeInputMode === 'single' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setTimeInputMode('single')}
                      style={{ borderRadius: '12px 0 0 12px' }}
                    >
                      Single slot
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${timeInputMode === 'range' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setTimeInputMode('range')}
                      style={{ borderRadius: '0 12px 12px 0' }}
                    >
                      Shift start/end
                    </button>
                  </div>

                  {timeInputMode === 'single' ? (
                    <div className="admin-slot-picker-row">
                      <input
                        type="time"
                        className="form-control"
                        style={{ flex: 1, borderRadius: '12px' }}
                        value={currentSlotTime}
                        onChange={(e) => setCurrentSlotTime(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-primary px-4"
                        style={{ borderRadius: '12px' }}
                        onClick={handleAddSlot}
                      >
                        Add Slot
                      </button>
                    </div>
                  ) : (
                    <div className="bg-light p-3 rounded-4 border border-primary-subtle">
                      <div className="row g-2">
                        <div className="col-5">
                          <label className="form-label small text-muted mb-1">Shift start</label>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={rangeStart}
                            onChange={(e) => setRangeStart(e.target.value)}
                            style={{ borderRadius: '10px' }}
                          />
                        </div>
                        <div className="col-5">
                          <label className="form-label small text-muted mb-1">Shift end</label>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={rangeEnd}
                            onChange={(e) => setRangeEnd(e.target.value)}
                            style={{ borderRadius: '10px' }}
                          />
                        </div>
                        <div className="col-2 d-flex align-items-end justify-content-end">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm w-100"
                            style={{ borderRadius: '10px', height: '31px' }}
                            onClick={handleGenerateRangeSlots}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-end mt-3">
                    <button
                      type="button"
                      className="btn btn-link text-danger text-decoration-none small fw-bold p-0"
                      onClick={handleClearSelectedDays}
                    >
                      <i className="bi bi-trash3 me-1"></i>
                      Clear slots for selected days
                    </button>
                  </div>

                  <div className="admin-slots-summary mt-3">
                    {Object.keys(doctorForm.slots).length === 0 ? (
                      <p className="text-muted small mb-0">No custom slots added. Default slots will be used.</p>
                    ) : (
                      <div className="admin-days-grid">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
                          (day) =>
                            doctorForm.slots[day] && (
                              <div key={day} className="admin-day-group">
                                <span className="admin-day-label">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                                <div className="admin-slot-chips">
                                  {doctorForm.slots[day].map((time) => (
                                    <span key={time} className="admin-slot-chip">
                                      {time}
                                      <button
                                        type="button"
                                        className="admin-slot-remove"
                                        onClick={() => handleRemoveSlot(day, time)}
                                        aria-label={`Remove slot ${time}`}
                                      >
                                        &times;
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12">
                  <div
                    className="dashboard-profile-mini-card"
                    style={{ border: '1px solid rgba(0,0,0,0.07)' }}
                  >
                    <span className="dashboard-section-card-label">Image preview</span>
                    <div className="d-flex align-items-center gap-3 mt-2">
                      <img
                        src={doctorForm.image || defaultDoctorImage}
                        alt={doctorForm.name || 'Doctor preview'}
                        style={{
                          width: '72px',
                          height: '72px',
                          objectFit: 'cover',
                          borderRadius: '16px',
                        }}
                      />
                      <div>
                        <strong className="d-block">
                          {doctorForm.name || 'Doctor name preview'}
                        </strong>
                        <span className="text-muted small">
                          {doctorForm.specialty || 'Pediatrician'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {doctorForm.image && (
                  <div className="col-12">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      type="button"
                      onClick={() =>
                        setDoctorForm((current) => ({
                          ...current,
                          image: '',
                        }))
                      }
                    >
                      Remove uploaded photo
                    </button>
                  </div>
                )}

                <div className="col-12">
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary" type="submit">
                      {doctorForm.id ? 'Update Doctor' : 'Save Doctor'}
                    </button>
                    {doctorForm.id && (
                      <button
                        className="btn btn-outline-danger"
                        type="button"
                        onClick={resetDoctorForm}
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
          <article className="dashboard-twin-summary-card h-100">
            <div className="admin-section-header">
              <div>
                <span className="dashboard-section-card-label">Doctor directory</span>
                <h3 className="h5 mt-2 mb-1">Available pediatrician profiles</h3>
                <p className="dashboard-inline-hint mb-0">
                  Search, review, and manage the same doctors shown across the app.
                </p>
              </div>
              <span className="dashboard-save-badge">
                {filteredDoctors.length} of {allDoctors.length}
              </span>
            </div>

            <div className="admin-toolbar">
              <input
                className="form-control admin-search-input"
                type="search"
                placeholder="Search by name, email, or specialty"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <select
                className="form-select admin-filter-select"
                value={profileFilter}
                onChange={(event) => setProfileFilter(event.target.value)}
              >
                <option value="all">All profiles</option>
                <option value="editable">Editable only</option>
                <option value="preloaded">Preloaded only</option>
              </select>
            </div>

            <div className="admin-summary-strip">
              <div className="admin-summary-pill">
                <strong>{allDoctors.length}</strong>
                <span>Total directory</span>
              </div>
              <div className="admin-summary-pill">
                <strong>{savedDoctors.length}</strong>
                <span>Admin-managed</span>
              </div>
              <div className="admin-summary-pill">
                <strong>{allDoctors.filter((doctor) => doctor.password).length}</strong>
                <span>Login ready</span>
              </div>
            </div>

            {filteredDoctors.length ? (
              <div className="admin-record-list">
                {filteredDoctors.map((doctor) => (
                  <article className="admin-record-card" key={doctor.id}>
                    <div className="admin-record-main">
                      <div className="admin-record-identity">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          style={{
                            width: '68px',
                            height: '68px',
                            objectFit: 'cover',
                            borderRadius: '18px',
                          }}
                        />
                        <div>
                          <div className="admin-record-title-row">
                            <h4>{doctor.name}</h4>
                            <span className="growth-chip">{doctor.rating.toFixed(1)} rating</span>
                          </div>
                          <p className="admin-record-subtitle">{doctor.specialty}</p>
                          <div className="admin-meta-row">
                            <span>{doctor.email}</span>
                            <span>{Object.keys(doctor.slots ?? {}).length} schedule groups</span>
                            <span>{doctor.source === 'custom' ? 'Editable profile' : 'Preloaded profile'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="admin-detail-grid">
                        <div className="admin-detail-cell">
                          <span className="admin-detail-label">Sign-in</span>
                          <strong>{doctor.password ? 'Configured' : 'Not assigned yet'}</strong>
                        </div>
                        <div className="admin-detail-cell">
                          <span className="admin-detail-label">Availability</span>
                          <strong>{Object.values(doctor.slots ?? {}).flat().length} time slots</strong>
                        </div>
                      </div>
                    </div>
                    <div className="admin-record-actions">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        type="button"
                        onClick={() => handleEditDoctor(doctor)}
                      >
                        Edit
                      </button>
                      {confirmDeleteDoctorId === doctor.id ? (
                        <>
                          <button
                            className="btn btn-danger btn-sm"
                            type="button"
                            onClick={() => handleDeleteDoctor(doctor.id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            type="button"
                            onClick={() => setConfirmDeleteDoctorId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          type="button"
                          onClick={() => setConfirmDeleteDoctorId(doctor.id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="dashboard-profile-empty-state">
                No doctor profiles match the current search or filter.
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

export default AdminDoctorsSection
