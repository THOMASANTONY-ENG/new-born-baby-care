import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../components/style/parentdashboard.css'
import { getSavedBabyProfile } from '../utils/babyProfile'
import { getLoggedInUser } from '../utils/navigation'
import { getSavedAppointments, saveAppointment } from '../utils/appointments'
import { doctors } from '../data/doctors'

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

const AppointmentSection = () => {
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'
  const savedProfile = getSavedBabyProfile(loggedInUser?.email)
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
  const [appointmentForm, setAppointmentForm] = useState(() => ({
    babyLabel: babyOptions[0]?.label ?? '',
    visitType: babyOptions[0]?.visitType ?? 'Routine checkup',
    appointmentDate: '',
    appointmentTime: '',
    clinicName: doctors[0]?.name ?? '',
    notes: '',
  }))
  const [savedAppointments, setSavedAppointments] = useState(() =>
    getSavedAppointments(loggedInUser?.email)
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
  const availableSlots =
    selectedDoctor && selectedDayKey ? selectedDoctor.slots?.[selectedDayKey] ?? [] : []

  useEffect(() => {
    setAppointmentForm((current) => {
      if (!current.appointmentDate || !current.clinicName) {
        return current
      }

      const currentDoctor = doctors.find((doctor) => doctor.name === current.clinicName)
      const currentDayKey = getDayKey(current.appointmentDate)
      const nextSlots =
        currentDoctor && currentDayKey ? currentDoctor.slots?.[currentDayKey] ?? [] : []

      if (!nextSlots.length) {
        return {
          ...current,
          appointmentTime: '',
        }
      }

      if (nextSlots.includes(current.appointmentTime)) {
        return current
      }

      return {
        ...current,
        appointmentTime: nextSlots[0],
      }
    })
  }, [appointmentForm.appointmentDate, appointmentForm.clinicName])

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

      return {
        ...current,
        [name]: value,
      }
    })
  }

  const handleBookAppointment = (event) => {
    event.preventDefault()

    const nextAppointment = {
      id: `${Date.now()}`,
      babyLabel: appointmentForm.babyLabel,
      babyName: selectedBaby?.displayName ?? appointmentForm.babyLabel,
      visitType: appointmentForm.visitType,
      appointmentDate: appointmentForm.appointmentDate,
      appointmentTime: appointmentForm.appointmentTime,
      clinicName: appointmentForm.clinicName,
      notes: appointmentForm.notes,
    }

    const nextSavedAppointments = saveAppointment(nextAppointment, loggedInUser?.email)
    setSavedAppointments(nextSavedAppointments)
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

  if (role !== 'parent') {
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
      <div className="dashboard-section-intro">
        <span className="dashboard-section-label">Appointments</span>
        <h2 className="dashboard-section-title">Appointment planner for your family</h2>
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
                    Available slot
                  </label>
                  <select
                    className="form-select"
                    id="appointmentTime"
                    name="appointmentTime"
                    value={appointmentForm.appointmentTime}
                    onChange={handleAppointmentChange}
                    disabled={!availableSlots.length}
                    required
                  >
                    <option value="">
                      {availableSlots.length ? 'Select slot' : 'No slots for selected date'}
                    </option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
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
                  <button className="btn btn-primary" type="submit">
                    Book Appointment
                  </button>
                </div>
              </div>
            </form>
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
                {savedAppointments.map((appointment) => (
                  <article className="appointment-saved-card" key={appointment.id}>
                    <div className="appointment-saved-header">
                      <div>
                        <span className="dashboard-section-card-label">
                          {appointment.babyLabel}
                        </span>
                        <h4>{appointment.babyName}</h4>
                      </div>
                      <span className="appointment-chip">{appointment.visitType}</span>
                    </div>

                    <div className="appointment-saved-meta">
                      <span>Date: {appointment.appointmentDate}</span>
                      <span>Time: {appointment.appointmentTime}</span>
                      <span>Clinic: {appointment.clinicName}</span>
                    </div>

                    {appointment.notes && <p className="mb-0">{appointment.notes}</p>}
                  </article>
                ))}
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
