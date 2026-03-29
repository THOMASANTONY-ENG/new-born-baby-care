import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../components/style/parentdashboard.css'
import { getSavedBabyProfile } from '../utils/babyProfile'
import { getLoggedInUser } from '../utils/navigation'
import { getSavedAppointments, saveAppointment } from '../utils/appointments'
import { getAvailableDoctors } from '../utils/doctors'
import { getEffectiveUserEmail, getActivePatientEmail } from '../utils/doctorNavigation'
import ActivePatientBanner from '../components/ActivePatientBanner'

const appointmentStages = [
  {
    minAgeDays: 0,
    nextMilestoneDays: 42,
    title: 'Newborn follow-up',
    time: 'Birth to 2 weeks',
    purpose: 'Review feeding, jaundice, weight gain, and early newborn care.',
    checklist: ['Birth records', 'Baby feeding notes', 'Questions about sleep and stool'],
  },
  {
    minAgeDays: 42,
    nextMilestoneDays: 70,
    title: '6-week vaccination visit',
    time: 'Around 6 weeks',
    purpose: 'Discuss first routine immunization visit and general growth check.',
    checklist: ['Vaccination card', 'Baby weight record', 'Any fever or cough updates'],
  },
  {
    minAgeDays: 70,
    nextMilestoneDays: 98,
    title: '10-week follow-up',
    time: 'Around 10 weeks',
    purpose: 'Continue routine vaccines and review feeding, sleep, and activity.',
    checklist: ['Vaccination card', 'Feeding questions', 'Medicine list if any'],
  },
  {
    minAgeDays: 98,
    nextMilestoneDays: 270,
    title: '14-week visit',
    time: 'Around 14 weeks',
    purpose: 'Complete early primary vaccine series and review development.',
    checklist: ['Vaccination card', 'Weight and height record', 'Daily routine questions'],
  },
  {
    minAgeDays: 270,
    nextMilestoneDays: 480,
    title: '9 to 12 month visit',
    time: '9 to 12 months',
    purpose: 'Vaccination review, nutrition check, and developmental screening.',
    checklist: ['Vaccination card', 'Weaning and food notes', 'Any allergy concerns'],
  },
  {
    minAgeDays: 480,
    nextMilestoneDays: null,
    title: 'Booster and toddler follow-up',
    time: '16 to 24 months',
    purpose: 'Booster vaccines, development review, and routine toddler guidance.',
    checklist: ['Vaccination card', 'Sleep and behavior questions', 'Recent illness history'],
  },
]

const visitTypeOptions = [
  'Newborn follow-up',
  'Vaccination visit',
  'Routine checkup',
  'Growth review',
  'Feeding consultation',
  'Fever or sick visit',
]

const getBabyLabel = (familyType, index) =>
  familyType === 'twins' ? `Twin ${index === 0 ? 'A' : 'B'}` : 'Baby'

const hasProfileData = (profile = {}) => Object.values(profile).some(Boolean)

const parseDate = (value) => {
  if (!value) {
    return null
  }

  const parsedDate = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

const calculateAgeDays = (dob) => {
  const parsedDob = parseDate(dob)

  if (!parsedDob) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Math.max(0, Math.floor((today - parsedDob) / 86400000))
}

const formatAge = (ageDays) => {
  if (ageDays === null) {
    return 'Date of birth needed'
  }

  if (ageDays < 30) {
    return `${ageDays} day${ageDays === 1 ? '' : 's'} old`
  }

  const months = Math.floor(ageDays / 30.4)

  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} old`
  }

  const years = Math.floor(months / 12)
  return `${years} year${years === 1 ? '' : 's'} old`
}

const getNextAppointmentStage = (ageDays) => {
  if (ageDays === null) {
    return appointmentStages[0]
  }

  return (
    appointmentStages.find((stage, index) => {
      const nextStage = appointmentStages[index + 1]
      return ageDays < stage.minAgeDays || !nextStage || ageDays < nextStage.minAgeDays
    }) ?? appointmentStages[appointmentStages.length - 1]
  )
}

const getTodayDate = () => {
  const today = new Date()
  const month = `${today.getMonth() + 1}`.padStart(2, '0')
  const day = `${today.getDate()}`.padStart(2, '0')

  return `${today.getFullYear()}-${month}-${day}`
}

const getDayKey = (dateValue) => {
  if (!dateValue) {
    return ''
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  return parsedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
}

const getSlotsForDoctorAndDate = (doctors, clinicName, appointmentDate) => {
  if (!clinicName || !appointmentDate) {
    return []
  }

  const selectedDoctor = doctors.find((doctor) => doctor.name === clinicName)
  const selectedDayKey = getDayKey(appointmentDate)

  return selectedDoctor && selectedDayKey ? selectedDoctor.slots?.[selectedDayKey] ?? [] : []
}

/** Convert a 24-h "HH:MM" string (from <input type="time">) to "h:mm AM/PM" for display */
const formatTime24 = (value) => {
  if (!value) return ''
  // Already in AM/PM format
  if (/AM|PM/i.test(value)) return value
  const m = value.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return value
  const h = Number(m[1])
  const min = m[2]
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${min} ${period}`
}

const getAppointmentStatus = (appointmentDate, appointmentTime = '') => {
  const apptDt = (() => {
    if (!appointmentDate) return null
    const base = new Date(`${appointmentDate}T00:00:00`)
    if (Number.isNaN(base.getTime())) return null
    if (appointmentTime) {
      // Support both "HH:MM" (24h from input[type=time]) and "h:mm AM/PM"
      const m24 = appointmentTime.match(/^(\d{1,2}):(\d{2})$/)
      if (m24) {
        base.setHours(Number(m24[1]), Number(m24[2]), 0, 0)
      } else {
        const m = appointmentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
        if (m) {
          let h = Number(m[1]) % 12
          if (m[3].toUpperCase() === 'PM') h += 12
          base.setHours(h, Number(m[2]), 0, 0)
        }
      }
    }
    return base
  })()

  if (!apptDt) return { label: 'Unknown', color: '#888', bg: '#f3f4f6' }

  const now = new Date()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  if (apptDt < todayStart) return { label: 'Past', color: '#6b7280', bg: '#f3f4f6' }
  if (apptDt <= todayEnd) return { label: 'Today', color: '#b45309', bg: '#fef3c7' }
  return { label: 'Upcoming', color: '#15803d', bg: '#dcfce7' }
}

const AppointmentSection = () => {
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'
  const isDoctor = role === 'doctor'
  const effectiveEmail = getEffectiveUserEmail(loggedInUser)
  const doctors = getAvailableDoctors()
  const savedProfile = getSavedBabyProfile(effectiveEmail)
  const familyType = savedProfile?.familyType === 'twins' ? 'twins' : 'single'
  const babies = savedProfile?.babies ?? []
  const availableBabies = babies.filter((profile) => hasProfileData(profile))
  const appointmentSummaries = availableBabies.map((profile, index) => {
    const ageDays = calculateAgeDays(profile.dob)
    const nextAppointment = getNextAppointmentStage(ageDays)

    return {
      profile,
      ageDays,
      label: getBabyLabel(familyType, index),
      displayName: profile.name || getBabyLabel(familyType, index),
      nextAppointment,
    }
  })
  const babyOptions = appointmentSummaries.map(({ label, displayName, nextAppointment }) => ({
    label,
    displayName,
    visitType: nextAppointment.title,
  }))
  const [toastMessage, setToastMessage] = useState('')
  const [pendingAppointment, setPendingAppointment] = useState(null)
  const [appointmentForm, setAppointmentForm] = useState(() => ({
    babyLabel: babyOptions[0]?.label ?? '',
    visitType: babyOptions[0]?.visitType ?? 'Routine checkup',
    appointmentDate: '',
    appointmentTime: '',
    clinicName: doctors[0]?.name ?? '',
    notes: '',
  }))
  const [savedAppointments, setSavedAppointments] = useState(() =>
    getSavedAppointments(effectiveEmail)
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

  const nextOverallVisit =
    appointmentSummaries.find(({ ageDays }) => ageDays !== null)?.nextAppointment?.time ??
    'Birth to 2 weeks'
  const selectedBaby =
    babyOptions.find((option) => option.label === appointmentForm.babyLabel) ?? babyOptions[0]
  const selectedDoctor = doctors.find((doctor) => doctor.name === appointmentForm.clinicName)
  const selectedDayKey = getDayKey(appointmentForm.appointmentDate)
  const availableSlots = getSlotsForDoctorAndDate(
    doctors,
    appointmentForm.clinicName,
    appointmentForm.appointmentDate
  )

  const handleAppointmentChange = (event) => {
    const { name, value } = event.target

    setAppointmentForm((current) => {
      if (name === 'babyLabel') {
        const nextSelectedBaby = babyOptions.find((option) => option.label === value)

        return {
          ...current,
          babyLabel: value,
          visitType: nextSelectedBaby?.visitType ?? current.visitType,
        }
      }

      // When date or doctor changes, update slot hints but don't override a manually-typed time
      if (name === 'appointmentDate' || name === 'clinicName') {
        return {
          ...current,
          [name]: value,
        }
      }

      return {
        ...current,
        [name]: value,
      }
    })
  }

  const handleBookAppointment = (event) => {
    event.preventDefault()
    // Stage the appointment for in-page confirmation instead of window.confirm()
    setPendingAppointment({
      id: `${Date.now()}`,
      babyLabel: appointmentForm.babyLabel,
      babyName: selectedBaby?.displayName ?? appointmentForm.babyLabel,
      visitType: appointmentForm.visitType,
      appointmentDate: appointmentForm.appointmentDate,
      appointmentTime: appointmentForm.appointmentTime,
      clinicName: appointmentForm.clinicName,
      notes: appointmentForm.notes,
    })
  }

  const handleConfirmAppointment = () => {
    if (!pendingAppointment) return
    const nextSavedAppointments = saveAppointment(pendingAppointment, effectiveEmail)
    setSavedAppointments(nextSavedAppointments)
    setPendingAppointment(null)
    setAppointmentForm({
      babyLabel: babyOptions[0]?.label ?? '',
      visitType: babyOptions[0]?.visitType ?? 'Routine checkup',
      appointmentDate: '',
      appointmentTime: '',
      clinicName: doctors[0]?.name ?? '',
      notes: '',
    })
    setToastMessage('Appointment booked successfully.')
  }

  const handleCancelPending = () => {
    setPendingAppointment(null)
  }

  if (isDoctor && !getActivePatientEmail()) {
    return (
      <section className="dashboard-section-panel parent-dashboard-page">
        <div className="dashboard-section-intro">
          <span className="dashboard-section-label">Provider view</span>
          <h2 className="dashboard-section-title">No Patient Selected</h2>
          <p className="dashboard-section-copy">
            Please return to your patient list to select an active patient chart before booking appointments.
          </p>
        </div>
        <div className="dashboard-section-card">
          <Link className="btn btn-primary" to="/dashboard">Return to Patient List</Link>
        </div>
      </section>
    )
  }

  if (role === 'admin') {
    return (
      <section className="dashboard-section-panel parent-dashboard-page">
        <div className="dashboard-section-intro">
          <span className="dashboard-section-label">{role} view</span>
          <h2 className="dashboard-section-title">Appointments</h2>
          <p className="dashboard-section-copy">
            This section is designed for parents and uses the saved baby profile to suggest care
            visits.
          </p>
        </div>

        <div className="dashboard-section-card">
          <p className="mb-3">Sign in with a parent account to see baby-specific appointments.</p>
          <p className="mb-0">Current account: {loggedInUser?.email || 'No email found'}</p>
        </div>
      </section>
    )
  }

  if (!availableBabies.length) {
    return (
      <section className="dashboard-section-panel parent-dashboard-page">
        <div className="dashboard-section-intro">
          <span className="dashboard-section-label">Appointments</span>
          <h2 className="dashboard-section-title">Add a baby profile first</h2>
          <p className="dashboard-section-copy mb-0">
            Save your baby profile so the appointments section can suggest the next visit.
          </p>
        </div>

        <div className="dashboard-section-card">
          <p className="mb-3">
            Once the profile is saved, this page will help you prepare for checkups, vaccines, and
            routine follow-ups.
          </p>
          <Link className="btn btn-primary" to="/dashboard">
            Go to Dashboard
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard-section-panel parent-dashboard-page appointment-page">
      <ActivePatientBanner />

      {/* 3-day reminder banner */}
      {savedAppointments.some((appt) => {
        if (!appt.appointmentDate) return false
        const apptDate = new Date(`${appt.appointmentDate}T00:00:00`)
        if (Number.isNaN(apptDate.getTime())) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const diffDays = Math.ceil((apptDate - today) / 86400000)
        return diffDays >= 0 && diffDays <= 3
      }) && (
        <div
          className="d-flex align-items-center gap-3 mb-4"
          role="alert"
          style={{
            background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
            border: '1.5px solid #fcd34d',
            borderRadius: '12px',
            padding: '0.9rem 1.2rem',
            color: '#78350f',
          }}
        >
          <span style={{ fontSize: '1.3rem' }}>🔔</span>
          <div>
            <strong>Upcoming appointment reminder</strong> — You have an appointment within the next
            3 days. Check your saved bookings below and prepare the required documents.
          </div>
        </div>
      )}
      <div className="dashboard-section-intro">
        <span className="dashboard-section-label">Appointments</span>
        <h2 className="dashboard-section-title">Appointment planner for {isDoctor ? 'this' : 'your'} family</h2>
        <p className="dashboard-section-copy mb-0">
          Keep routine baby visits organized and prepare for each appointment with the right notes.
        </p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <article className="appointment-guide-card h-100">
            <span className="appointment-guide-step">Step 1</span>
            <h3>Check the next visit</h3>
            <p className="mb-0">
              Each baby card shows the next expected appointment based on the saved date of birth.
            </p>
          </article>
        </div>

        <div className="col-lg-4">
          <article className="appointment-guide-card h-100">
            <span className="appointment-guide-step">Step 2</span>
            <h3>Prepare before you go</h3>
            <p className="mb-0">
              Keep records, vaccination card, and your questions ready for the pediatrician.
            </p>
          </article>
        </div>

        <div className="col-lg-4">
          <article className="appointment-guide-card h-100">
            <span className="appointment-guide-step">Step 3</span>
            <h3>Go earlier if needed</h3>
            <p className="mb-0">
              Do not wait for the planned visit if the baby has feeding problems, fever, or breathing trouble.
            </p>
          </article>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <article className="appointment-summary-card h-100">
            <span className="dashboard-section-card-label">Profile type</span>
            <h3>{familyType === 'twins' ? 'Twins care plan' : 'Single baby care plan'}</h3>
            <p className="mb-0">
              Tracking {availableBabies.length} saved {availableBabies.length === 1 ? 'baby' : 'babies'}.
            </p>
          </article>
        </div>

        <div className="col-md-4">
          <article className="appointment-summary-card h-100">
            <span className="dashboard-section-card-label">Next expected visit</span>
            <h3>{nextOverallVisit}</h3>
            <p className="mb-0">Use this page to plan when to see the pediatrician next.</p>
          </article>
        </div>

        <div className="col-md-4">
          <article className="appointment-summary-card h-100">
            <span className="dashboard-section-card-label">Quick reminder</span>
            <h3>Bring records</h3>
            <p className="mb-0">
              Carry the vaccination card, recent health notes, and current medicines to each visit.
            </p>
          </article>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-5">
          <article className="appointment-booking-card h-100">
            {pendingAppointment ? (
              /* ── In-page confirmation panel ── */
              <>
                <span className="dashboard-section-card-label">Confirm booking</span>
                <h3 className="appointment-booking-title">Review before saving</h3>
                <p className="mb-4">
                  Check the details below and confirm to save this appointment.
                </p>

                <div
                  style={{
                    background: 'rgba(215,240,232,0.45)',
                    border: '1px solid rgba(70,113,101,0.2)',
                    borderRadius: 14,
                    padding: '18px 20px',
                    marginBottom: 20,
                  }}
                >
                  {[
                    { label: 'Baby', value: pendingAppointment.babyName },
                    { label: 'Visit type', value: pendingAppointment.visitType },
                    { label: 'Doctor', value: pendingAppointment.clinicName },
                    { label: 'Date', value: pendingAppointment.appointmentDate },
                    { label: 'Time', value: formatTime24(pendingAppointment.appointmentTime) || '—' },
                    pendingAppointment.notes && { label: 'Notes', value: pendingAppointment.notes },
                  ]
                    .filter(Boolean)
                    .map(({ label, value }) => (
                      <div
                        key={label}
                        style={{
                          display: 'flex',
                          gap: 12,
                          padding: '6px 0',
                          borderBottom: '1px solid rgba(70,113,101,0.1)',
                        }}
                      >
                        <span
                          style={{
                            minWidth: 90,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: '#467165',
                            paddingTop: 2,
                          }}
                        >
                          {label}
                        </span>
                        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{value}</span>
                      </div>
                    ))}
                </div>

                <div className="d-flex gap-3">
                  <button
                    className="btn btn-primary"
                    type="button"
                    id="confirm-appointment-btn"
                    onClick={handleConfirmAppointment}
                  >
                    ✓ Confirm &amp; Save
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleCancelPending}
                  >
                    ← Go Back
                  </button>
                </div>
              </>
            ) : (
              /* ── Normal booking form ── */
              <>
                <span className="dashboard-section-card-label">Book appointment</span>
                <h3 className="appointment-booking-title">Schedule the next clinic visit</h3>
                <p className="mb-4">
                  Parents can book appointments here and keep a quick record of upcoming visits.
                </p>

                <form onSubmit={handleBookAppointment}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label" htmlFor="babyLabel">
                        Select baby
                      </label>
                      <select
                        className="form-select"
                        id="babyLabel"
                        name="babyLabel"
                        value={appointmentForm.babyLabel}
                        onChange={handleAppointmentChange}
                        required
                      >
                        {babyOptions.map((option) => (
                          <option key={option.label} value={option.label}>
                            {option.displayName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label" htmlFor="visitType">
                        Visit type
                      </label>
                      <select
                        className="form-select"
                        id="visitType"
                        name="visitType"
                        value={appointmentForm.visitType}
                        onChange={handleAppointmentChange}
                        required
                      >
                        {visitTypeOptions.map((visitType) => (
                          <option key={visitType} value={visitType}>
                            {visitType}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="appointmentDate">
                        Date
                      </label>
                      <input
                        className="form-control"
                        id="appointmentDate"
                        name="appointmentDate"
                        type="date"
                        value={appointmentForm.appointmentDate}
                        onChange={handleAppointmentChange}
                        min={getTodayDate()}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="appointmentTime">
                        Preferred time
                      </label>
                      <input
                        className="form-control"
                        id="appointmentTime"
                        name="appointmentTime"
                        type="time"
                        value={appointmentForm.appointmentTime}
                        onChange={handleAppointmentChange}
                        required
                      />
                      {availableSlots.length > 0 && (
                        <div className="mt-2 d-flex flex-wrap gap-1">
                          {availableSlots.map((slot) => {
                            // Convert "09:00 AM" → "09:00" for the time input
                            const toTime24 = (s) => {
                              const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
                              if (!m) return ''
                              let h = Number(m[1]) % 12
                              if (m[3].toUpperCase() === 'PM') h += 12
                              return `${String(h).padStart(2, '0')}:${m[2]}`
                            }
                            return (
                              <button
                                key={slot}
                                type="button"
                                className="appointment-slot-chip"
                                style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
                                onClick={() =>
                                  setAppointmentForm((prev) => ({
                                    ...prev,
                                    appointmentTime: toTime24(slot),
                                  }))
                                }
                              >
                                {slot}
                              </button>
                            )
                          })}
                        </div>
                      )}
                      {appointmentForm.appointmentDate && availableSlots.length === 0 && (
                        <p className="form-text text-muted mt-1 mb-0">
                          No preset slots for this day — enter any preferred time above.
                        </p>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label" htmlFor="clinicName">
                        Select doctor
                      </label>
                      <select
                        className="form-select"
                        id="clinicName"
                        name="clinicName"
                        value={appointmentForm.clinicName}
                        onChange={handleAppointmentChange}
                        required
                      >
                        {doctors.map((doctor) => (
                          <option key={doctor.name} value={doctor.name}>
                            {doctor.name} - {doctor.specialty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <article className="appointment-stage-card">
                        <span className="dashboard-section-card-label">Slots available</span>
                        <h4>
                          {selectedDoctor
                            ? `${selectedDoctor.name} on ${
                                selectedDayKey
                                  ? selectedDayKey.charAt(0).toUpperCase() + selectedDayKey.slice(1)
                                  : 'selected day'
                              }`
                            : 'Choose a doctor'}
                        </h4>
                        {availableSlots.length ? (
                          <div className="appointment-checklist">
                            {availableSlots.map((slot) => (
                              <span className="appointment-slot-chip" key={slot}>
                                {slot}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mb-0">
                            No available slots for this doctor on the selected date. Try another day.
                          </p>
                        )}
                      </article>
                    </div>

                    <div className="col-12">
                      <label className="form-label" htmlFor="notes">
                        Notes
                      </label>
                      <textarea
                        className="form-control"
                        id="notes"
                        name="notes"
                        rows="3"
                        value={appointmentForm.notes}
                        onChange={handleAppointmentChange}
                        placeholder="Add symptoms, questions, or reminders"
                      />
                    </div>

                    <div className="col-12">
                      <button className="btn btn-primary" type="submit" id="book-appointment-btn">
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </article>
        </div>

        <div className="col-xl-7">
          <article className="appointment-booking-card h-100">
            <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-3">
              <div>
                <span className="dashboard-section-card-label">Upcoming bookings</span>
                <h3 className="appointment-booking-title">Saved appointments</h3>
              </div>
              <span className="appointment-badge">
                {savedAppointments.length} booking{savedAppointments.length === 1 ? '' : 's'}
              </span>
            </div>

            {savedAppointments.length ? (
              <div className="appointment-booking-list">
                {savedAppointments.map((appointment) => {
                  const status = getAppointmentStatus(appointment.appointmentDate, appointment.appointmentTime)
                  return (
                    <article className="appointment-saved-card" key={appointment.id}>
                      <div className="appointment-saved-header">
                        <div>
                          <span className="dashboard-section-card-label">
                            {appointment.babyLabel}
                          </span>
                          <h4>{appointment.babyName}</h4>
                        </div>
                        <div className="d-flex flex-wrap gap-2 align-items-center">
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: status.bg,
                              color: status.color,
                              letterSpacing: '0.03em',
                            }}
                          >
                            {status.label}
                          </span>
                          <span className="appointment-chip">{appointment.visitType}</span>
                        </div>
                      </div>

                      <div className="appointment-saved-meta">
                        <span>Date: {appointment.appointmentDate}</span>
                        <span>Time: {formatTime24(appointment.appointmentTime)}</span>
                        <span>Clinic: {appointment.clinicName}</span>
                      </div>

                      {appointment.notes && <p className="mb-0">{appointment.notes}</p>}
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="dashboard-profile-empty-state">
                No appointments booked yet. Use the form to save the next clinic visit.
              </div>
            )}
          </article>
        </div>
      </div>

      <div className="row g-4">
        {appointmentSummaries.map(({ profile, ageDays, label, displayName, nextAppointment }) => (
          <div className={familyType === 'twins' ? 'col-xl-6' : 'col-12'} key={label}>
            <article className="appointment-baby-card h-100">
              <div className="appointment-baby-header">
                <div>
                  <span className="dashboard-section-card-label">{label}</span>
                  <h3>{displayName}</h3>
                </div>
                <span className="appointment-badge">Next: {nextAppointment.time}</span>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <article className="dashboard-profile-mini-card">
                    <span className="dashboard-section-card-label">Date of birth</span>
                    <strong>{profile.dob || 'Not provided'}</strong>
                  </article>
                </div>
                <div className="col-sm-6">
                  <article className="dashboard-profile-mini-card">
                    <span className="dashboard-section-card-label">Age</span>
                    <strong>{formatAge(ageDays)}</strong>
                  </article>
                </div>
              </div>

              <div className="appointment-detail-grid">
                <article className="appointment-stage-card">
                  <span className="dashboard-section-card-label">Suggested visit</span>
                  <h4>{nextAppointment.title}</h4>
                  <p className="mb-0">{nextAppointment.purpose}</p>
                </article>

                <article className="appointment-stage-card">
                  <span className="dashboard-section-card-label">Bring to visit</span>
                  <h4>Prepare these items</h4>
                  <div className="appointment-checklist">
                    {nextAppointment.checklist.map((item) => (
                      <span className="appointment-chip" key={`${label}-${item}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              </div>
            </article>
          </div>
        ))}
      </div>

      <div className="row g-4 mt-1">
        <div className="col-lg-6">
          <article className="appointment-summary-card h-100">
            <span className="dashboard-section-card-label">Plan ahead</span>
            <h3>Before the visit</h3>
            <div className="appointment-tips">
              <p className="mb-2">Write down fever, feeding, sleep, and stool changes.</p>
              <p className="mb-2">Keep previous prescriptions and immunization records ready.</p>
              <p className="mb-0">One visit may include multiple vaccines and routine review.</p>
            </div>
          </article>
        </div>

        <div className="col-lg-6">
          <article className="appointment-summary-card h-100">
            <span className="dashboard-section-card-label">Seek earlier care</span>
            <h3>Contact the doctor sooner if needed</h3>
            <div className="appointment-tips">
              <p className="mb-2">Poor feeding, repeated vomiting, breathing trouble, or fever.</p>
              <p className="mb-2">Low activity, dehydration signs, or unusual crying.</p>
              <p className="mb-0">Any symptom that worries you should be checked earlier.</p>
            </div>
          </article>
        </div>
      </div>

      {toastMessage && (
        <div className="dashboard-toast" role="status" aria-live="polite">
          <strong>Booked</strong>
          <p className="mb-0">{toastMessage}</p>
        </div>
      )}
    </section>
  )
}

export default AppointmentSection
