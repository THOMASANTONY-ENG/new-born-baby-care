import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../components/style/parentdashboard.css'
import { getSavedAppointments } from '../utils/appointments'
import { getLoggedInUser } from '../utils/navigation'
import { getSavedBabyProfile, saveBabyProfile } from '../utils/babyProfile'
import { getSharedResources } from '../utils/sharedResources'
import { getSavedCareNotes } from '../utils/careNotes'
import { getSavedGrowthLogs } from '../utils/growthLogs'

const emptyBabyProfile = {
  name: '',
  dob: '',
  gender: '',
  weight: '',
  height: '',
}

const emptyFamilyProfile = {
  familyType: 'single',
  babies: [{ ...emptyBabyProfile }],
}

const normalizeBabyProfile = (profile = {}) => ({
  name: profile.name ?? '',
  dob: profile.dob ?? '',
  gender: profile.gender ?? '',
  weight: profile.weight ?? '',
  height: profile.height ?? '',
})

const normalizeFamilyProfile = (profile = emptyFamilyProfile) => {
  const familyType = profile?.familyType === 'twins' ? 'twins' : 'single'
  const babyCount = familyType === 'twins' ? 2 : 1
  const babies = Array.from({ length: babyCount }, (_, index) =>
    normalizeBabyProfile(profile?.babies?.[index] ?? emptyBabyProfile)
  )

  return {
    familyType,
    babies,
  }
}

const getBabyLabel = (familyType, index) =>
  familyType === 'twins' ? `Twin ${index === 0 ? 'A' : 'B'}` : 'Baby'

const profilesMatch = (leftProfile, rightProfile) =>
  JSON.stringify(normalizeFamilyProfile(leftProfile)) ===
  JSON.stringify(normalizeFamilyProfile(rightProfile))

const hasProfileData = (profile = {}) => Object.values(normalizeBabyProfile(profile)).some(Boolean)

const profileFields = ['name', 'dob', 'gender', 'weight', 'height']

const countFilledFields = (profile = {}) =>
  profileFields.reduce(
    (total, field) => total + (normalizeBabyProfile(profile)[field] ? 1 : 0),
    0
  )

const vaccineMilestones = [
  { ageLabel: 'Birth', minAgeDays: 0 },
  { ageLabel: '6 weeks', minAgeDays: 42 },
  { ageLabel: '10 weeks', minAgeDays: 70 },
  { ageLabel: '14 weeks', minAgeDays: 98 },
  { ageLabel: '9 to 12 months', minAgeDays: 270 },
  { ageLabel: '16 to 24 months', minAgeDays: 480 },
  { ageLabel: '5 to 6 years', minAgeDays: 1825 },
  { ageLabel: '10 years and 16 years', minAgeDays: 3650 },
]

const parseDate = (value) => {
  if (!value) {
    return null
  }

  const parsedDate = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

const addDays = (dateValue, days) => {
  const parsedDate = parseDate(dateValue)

  if (!parsedDate) {
    return null
  }

  const nextDate = new Date(parsedDate)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
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

const getNextDueStage = (ageDays) => {
  if (ageDays === null) {
    return vaccineMilestones[0]
  }

  return (
    vaccineMilestones.find((stage, index) => {
      const nextStage = vaccineMilestones[index + 1]
      return ageDays < stage.minAgeDays || !nextStage || ageDays < nextStage.minAgeDays
    }) ?? vaccineMilestones[vaccineMilestones.length - 1]
  )
}

const formatLongDate = (value, fallback = 'Not added yet') => {
  const parsedDate =
    value instanceof Date ? value : typeof value === 'string' ? parseDate(value) : null

  if (!parsedDate) {
    return fallback
  }

  return parsedDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatTextValue = (value, fallback = 'Not added yet') => value || fallback

const formatMeasurement = (value, unit) => {
  if (!value) {
    return null
  }

  return /\d/.test(value) ? `${value} ${unit}` : value
}

const parseAppointmentDateTime = (dateValue, timeValue = '') => {
  const parsedDate = parseDate(dateValue)

  if (!parsedDate) {
    return null
  }

  if (!timeValue) {
    return parsedDate
  }

  const timeMatch = timeValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)

  if (!timeMatch) {
    return parsedDate
  }

  const [, hourValue, minuteValue, meridiem] = timeMatch
  let nextHour = Number(hourValue) % 12

  if (meridiem.toUpperCase() === 'PM') {
    nextHour += 12
  }

  const nextDate = new Date(parsedDate)
  nextDate.setHours(nextHour, Number(minuteValue), 0, 0)

  return nextDate
}

const getFamilyDisplayName = (babies, familyType) => {
  const savedNames = babies
    .map((profile) => profile.name?.trim())
    .filter(Boolean)

  if (savedNames.length === 1) {
    return savedNames[0]
  }

  if (savedNames.length === 2) {
    return `${savedNames[0]} and ${savedNames[1]}`
  }

  return familyType === 'twins' ? 'your twins' : 'your baby'
}

const roleTitles = {
  parent: 'Parent user',
  doctor: 'Doctor user',
  admin: 'Admin user',
}

const ParentDashboard = () => {
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'
  const isParentView = role === 'parent'
  const [savedProfile, setSavedProfile] = useState(() =>
    normalizeFamilyProfile(getSavedBabyProfile(loggedInUser?.email) ?? emptyFamilyProfile)
  )
  const [profileDraft, setProfileDraft] = useState(savedProfile)
  const [hiddenTwinDraft, setHiddenTwinDraft] = useState(() =>
    normalizeBabyProfile(savedProfile.babies[1] ?? emptyBabyProfile)
  )
  const [isEditing, setIsEditing] = useState(() =>
    !savedProfile.babies.some((profile) => hasProfileData(profile))
  )
  const [toastMessage, setToastMessage] = useState('')
  const [profileErrors, setProfileErrors] = useState({})
  const [sharedResources] = useState(() => getSharedResources(loggedInUser?.email))

  useEffect(() => {
    if (!toastMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 2800)

    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  const handleFamilyTypeChange = (event) => {
    const nextFamilyType = event.target.value

    setProfileDraft((current) => {
      const currentBabies = current.babies ?? []
      const primaryBabyDraft = normalizeBabyProfile(currentBabies[0] ?? emptyBabyProfile)
      const secondaryBabyDraft = normalizeBabyProfile(
        currentBabies[1] ?? hiddenTwinDraft ?? emptyBabyProfile
      )

      if (nextFamilyType === 'single') {
        setHiddenTwinDraft(secondaryBabyDraft)
      }

      const nextBabies =
        nextFamilyType === 'twins'
          ? [primaryBabyDraft, secondaryBabyDraft]
          : [primaryBabyDraft]

      return {
        familyType: nextFamilyType,
        babies: nextBabies,
      }
    })
  }

  const handleChange = (index, event) => {
    const { name, value } = event.target

    if (index === 1) {
      setHiddenTwinDraft({
        ...normalizeBabyProfile(profileDraft.babies[index] ?? hiddenTwinDraft),
        [name]: value,
      })
    }

    setProfileDraft((current) => ({
      ...current,
      babies: current.babies.map((profile, profileIndex) =>
        profileIndex === index ? { ...profile, [name]: value } : profile
      ),
    }))

    const errorKey = `${index}-${name}`
    setProfileErrors((current) => {
      if (!current[errorKey]) {
        return current
      }

      const nextErrors = { ...current }
      delete nextErrors[errorKey]
      return nextErrors
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}

    profileDraft.babies.forEach((profile, index) => {
      if (!profile.dob) {
        nextErrors[`${index}-dob`] = 'Date of birth is required before saving the baby profile.'
      }
    })

    if (Object.keys(nextErrors).length > 0) {
      setProfileErrors(nextErrors)
      setToastMessage('Add date of birth for each baby before saving the profile.')
      return
    }

    const nextSavedProfile = normalizeFamilyProfile(profileDraft)
    saveBabyProfile(nextSavedProfile, loggedInUser?.email)
    setSavedProfile(nextSavedProfile)
    setProfileDraft(nextSavedProfile)
    setHiddenTwinDraft(normalizeBabyProfile(nextSavedProfile.babies[1] ?? emptyBabyProfile))
    setIsEditing(false)
    setProfileErrors({})
    setToastMessage(
      nextSavedProfile.familyType === 'twins'
        ? 'Twin baby profiles saved successfully.'
        : 'Baby profile saved successfully.'
    )
  }

  const handleOpenProfileEditor = () => {
    setIsEditing(true)

    window.requestAnimationFrame(() => {
      document.getElementById('profile-editor')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  const hasSavedProfile = savedProfile.babies.some((profile) => hasProfileData(profile))
  const hasChanges = !profilesMatch(profileDraft, savedProfile)
  const saveButtonLabel = profileDraft.familyType === 'twins' ? 'Save Both Profiles' : 'Save Profile'
  const visibleProfiles = isEditing ? profileDraft : savedProfile
  const dashboardTitle =
    visibleProfiles.familyType === 'twins' ? 'Twin baby profile' : 'Baby profile'
  const dashboardHeading =
    visibleProfiles.familyType === 'twins'
      ? 'Manage details for Twin A and Twin B'
      : 'Manage your baby profile'
  const savedAppointments = getSavedAppointments(loggedInUser?.email)
  const savedGrowthLogs = getSavedGrowthLogs(loggedInUser?.email)
  const savedCareNotes = getSavedCareNotes(loggedInUser?.email)
  const availableBabies = savedProfile.babies
    .map((profile, index) => ({
      profile,
      displayName: profile.name || getBabyLabel(savedProfile.familyType, index),
    }))
    .filter(({ profile }) => hasProfileData(profile))
  const totalDetailCount = savedProfile.babies.length * profileFields.length
  const completedDetailCount = savedProfile.babies.reduce(
    (total, profile) => total + countFilledFields(profile),
    0
  )
  const profileCompletion = totalDetailCount
    ? Math.round((completedDetailCount / totalDetailCount) * 100)
    : 0
  const profileStatusLabel = !hasSavedProfile
    ? 'Setup needed'
    : profileCompletion === 100
      ? 'Profile complete'
      : 'Profile in progress'
  const familyTypeLabel = savedProfile.familyType === 'twins' ? 'Twins profile' : 'Single baby profile'
  const familyDisplayName = getFamilyDisplayName(savedProfile.babies, savedProfile.familyType)
  const heroTitle = !isParentView
    ? 'Parent dashboard'
    : hasSavedProfile
      ? `Care overview for ${familyDisplayName}`
      : 'Set up your baby profile'
  const heroCopy = !isParentView
    ? 'This overview is designed for parent accounts. Sign in as a parent to manage baby profiles, vaccines, appointments, growth, and notes here.'
    : hasSavedProfile
      ? 'Start with the card that needs attention today. Each card tells you the next simple step.'
      : 'Fill in the baby details once. After that, this page will show vaccines, visits, growth, and notes in one place.'
  const profileStatusCopy = hasSavedProfile
    ? `${familyTypeLabel}. ${completedDetailCount} of ${totalDetailCount} details saved.`
    : 'No profile details saved yet. Start with the form below.'
  const primaryAction = !isParentView
    ? null
    : !hasSavedProfile
      ? { label: 'Complete profile below', type: 'button' }
      : profileCompletion === 100
        ? { label: 'Check next vaccine', type: 'link', path: '/dashboard/vaccination' }
        : { label: 'Finish profile', type: 'button' }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const vaccineCandidates = availableBabies
    .map(({ profile, displayName }) => {
      const ageDays = calculateAgeDays(profile.dob)
      const nextDueStage = getNextDueStage(ageDays)
      const dueDate = addDays(profile.dob, nextDueStage.minAgeDays)

      if (!dueDate) {
        return null
      }

      return {
        displayName,
        nextDueStage,
        dueDate,
      }
    })
    .filter(Boolean)
  const nextVaccineCandidate = vaccineCandidates.reduce((closest, current) => {
    if (!closest) {
      return current
    }

    return Math.abs(current.dueDate - today) < Math.abs(closest.dueDate - today)
      ? current
      : closest
  }, null)
  const nextVaccineTitle = nextVaccineCandidate
    ? `${nextVaccineCandidate.displayName}: ${nextVaccineCandidate.nextDueStage.ageLabel}`
    : 'Add date of birth'
  const nextVaccineCopy = nextVaccineCandidate
    ? `Usually due from ${formatLongDate(nextVaccineCandidate.dueDate)}. Open the vaccine page for the full stage details.`
    : 'Vaccines are shown from the birth date, so add that first.'
  const upcomingAppointment =
    savedAppointments.find((appointment) => {
      const appointmentDateTime = parseAppointmentDateTime(
        appointment.appointmentDate,
        appointment.appointmentTime
      )

      return appointmentDateTime && appointmentDateTime >= new Date()
    }) ?? null
  const appointmentTitle = upcomingAppointment
    ? `${formatLongDate(upcomingAppointment.appointmentDate)}${
        upcomingAppointment.appointmentTime ? ` at ${upcomingAppointment.appointmentTime}` : ''
      }`
    : 'No visit booked'
  const appointmentCopy = upcomingAppointment
    ? `${formatTextValue(
        upcomingAppointment.babyName || upcomingAppointment.babyLabel,
        'Baby'
      )} with ${formatTextValue(upcomingAppointment.clinicName, 'clinic name not added')}.`
    : 'Save the next doctor visit when you have a date.'
  const latestGrowthLog = savedGrowthLogs[0] ?? null
  const latestGrowthMeasurements = [
    formatMeasurement(latestGrowthLog?.weight, 'kg'),
    formatMeasurement(latestGrowthLog?.height, 'cm'),
  ].filter(Boolean)
  const growthTitle = latestGrowthLog
    ? `Updated on ${formatLongDate(latestGrowthLog.recordDate)}`
    : 'No growth update yet'
  const growthCopy = latestGrowthLog
    ? `${formatTextValue(
        latestGrowthLog.babyName || latestGrowthLog.babyLabel,
        'Baby'
      )}${latestGrowthMeasurements.length ? `: ${latestGrowthMeasurements.join(' and ')}.` : '.'}`
    : 'Add weight or height after the next check.'
  const latestCareNote = savedCareNotes[0] ?? null
  const noteTitle = latestCareNote ? latestCareNote.title : 'No care note yet'
  const noteCopy = latestCareNote
    ? `Saved on ${formatLongDate(latestCareNote.noteDate, 'a recent date')} for ${formatTextValue(
        latestCareNote.babyName,
        'your family'
      )}.`
    : 'Save reminders or observations in simple words.'

  return (
    <main className="container parent-dashboard-page">
      <div className="row justify-content-center">
        <div className="col-xl-10">
          <div className="card shadow-sm border-0 h-100 dashboard-profile-card">
            <div className="card-body p-4">
              <div className="dashboard-overview-hero mb-4">
                <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
                  <div>
                    <span className="dashboard-section-card-label">{roleTitles[role]}</span>
                    <h1 className="h3 mt-2 mb-3">{heroTitle}</h1>
                    <p className="text-muted mb-0">{heroCopy}</p>
                    {primaryAction && (
                      <div className="d-flex flex-wrap gap-3 mt-3">
                        {primaryAction.type === 'link' ? (
                          <Link className="btn btn-primary" to={primaryAction.path}>
                            {primaryAction.label}
                          </Link>
                        ) : (
                          <button className="btn btn-primary" type="button" onClick={handleOpenProfileEditor}>
                            {primaryAction.label}
                          </button>
                        )}

                        {hasSavedProfile && !isEditing && (
                          <button
                            className="btn btn-outline-primary"
                            type="button"
                            onClick={handleOpenProfileEditor}
                          >
                            Update profile
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isParentView && (
                    <div className="dashboard-overview-status" aria-label="Profile summary">
                      <span className="dashboard-save-badge">{profileStatusLabel}</span>
                      <p className="mb-0">{profileStatusCopy}</p>
                      <p className="mb-0">
                        {hasSavedProfile
                          ? 'You can update details any time.'
                          : 'Start with the profile form below.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {!isParentView && (
                <div className="dashboard-profile-empty-state">
                  This dashboard is only interactive for parent accounts. Use a parent sign-in to
                  edit profiles and open the care tracking sections.
                </div>
              )}

              {isParentView && (
                <>
                  <section className="mb-4" aria-labelledby="care-status-heading">
                    <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-3">
                      <div>
                        <span className="dashboard-section-card-label">Care status</span>
                        <h2 className="h5 mt-2 mb-1" id="care-status-heading">
                          What needs attention now
                        </h2>
                        <p className="mb-0 text-muted">
                          These cards use your saved information to show the next simple step.
                        </p>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-sm-6 col-xl-3">
                        <article className="dashboard-care-status-card h-100">
                          <span className="dashboard-section-card-label">Next vaccine</span>
                          <h3 className="h6 mt-2 mb-2">{nextVaccineTitle}</h3>
                          <p className="mb-0">{nextVaccineCopy}</p>
                          <Link
                            className="btn btn-outline-primary btn-sm mt-3 align-self-start"
                            to="/dashboard/vaccination"
                            aria-label="Open vaccination page to review the next vaccine stage"
                          >
                            Open Vaccination
                          </Link>
                        </article>
                      </div>

                      <div className="col-sm-6 col-xl-3">
                        <article className="dashboard-care-status-card h-100">
                          <span className="dashboard-section-card-label">Next appointment</span>
                          <h3 className="h6 mt-2 mb-2">{appointmentTitle}</h3>
                          <p className="mb-0">{appointmentCopy}</p>
                          <Link
                            className="btn btn-outline-primary btn-sm mt-3 align-self-start"
                            to="/dashboard/appointment"
                            aria-label="Open appointments page to review or book a visit"
                          >
                            Open Appointments
                          </Link>
                        </article>
                      </div>

                      <div className="col-sm-6 col-xl-3">
                        <article className="dashboard-care-status-card h-100">
                          <span className="dashboard-section-card-label">Last growth update</span>
                          <h3 className="h6 mt-2 mb-2">{growthTitle}</h3>
                          <p className="mb-0">{growthCopy}</p>
                          <Link
                            className="btn btn-outline-primary btn-sm mt-3 align-self-start"
                            to="/dashboard/growth"
                            aria-label="Open growth page to review saved measurements"
                          >
                            Open Growth
                          </Link>
                        </article>
                      </div>

                      <div className="col-sm-6 col-xl-3">
                        <article className="dashboard-care-status-card h-100">
                          <span className="dashboard-section-card-label">Latest note</span>
                          <h3 className="h6 mt-2 mb-2">{noteTitle}</h3>
                          <p className="mb-0">{noteCopy}</p>
                          <Link
                            className="btn btn-outline-primary btn-sm mt-3 align-self-start"
                            to="/dashboard/notes"
                            aria-label="Open notes page to review or add a care note"
                          >
                            Open Notes
                          </Link>
                        </article>
                      </div>

                      <div className="col-sm-6 col-xl-3">
                        <article className="dashboard-care-status-card h-100">
                          <span className="dashboard-section-card-label">Parent feedback</span>
                          <h3 className="h6 mt-2 mb-2">Share your experience</h3>
                          <p className="mb-0">
                            Leave feedback about what feels helpful, confusing, or still missing for your family.
                          </p>
                          <Link
                            className="btn btn-outline-primary btn-sm mt-3 align-self-start"
                            to="/dashboard/feedback"
                            aria-label="Open parent feedback page to submit your review"
                          >
                            Open Feedback
                          </Link>
                        </article>
                      </div>
                    </div>
                  </section>

                  {isParentView && sharedResources.length > 0 && (
                    <section className="mb-5 dashboard-section-panel border-primary" style={{ borderWidth: '2px', borderStyle: 'solid', borderRadius: '8px', padding: '1.5rem' }} aria-labelledby="prescriptions-heading">
                      <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-3">
                        <div>
                          <span className="dashboard-section-card-label text-primary">Provider Prescriptions</span>
                          <h2 className="h5 mt-2 mb-1" id="prescriptions-heading">
                            Educational packets from your doctor
                          </h2>
                          <p className="mb-0 text-muted">
                            Your healthcare provider assigned the following reading materials for your family.
                          </p>
                        </div>
                      </div>
                      <div className="row g-3">
                        {sharedResources.map((res) => (
                          <div className="col-md-6" key={res.id}>
                            <article className="dashboard-care-status-card h-100 border border-primary">
                              <span className="dashboard-section-card-label">Shared on {new Date(res.sharedAt).toLocaleDateString()}</span>
                              <h3 className="h6 mt-2 mb-2">{res.title}</h3>
                              <p className="mb-0 text-muted small">{res.description}</p>
                              <a href={res.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm mt-3 align-self-start">
                                Read More
                              </a>
                            </article>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {(isEditing || !hasSavedProfile) ? (
                    <form id="profile-editor" onSubmit={handleSubmit}>
                      <div className="dashboard-form-intro mb-4">
                        <span className="dashboard-section-card-label">
                          {hasSavedProfile ? 'Profile editor' : dashboardTitle}
                        </span>
                        <h2 className="h4 mt-2 mb-2">{dashboardHeading}</h2>
                        <p className="mb-0 text-muted">
                          {hasSavedProfile
                            ? 'Update the key details here, then save to refresh the dashboard overview.'
                            : 'Choose whether this is a single baby or twins, then save the profile to unlock the rest of the dashboard.'}
                        </p>
                      </div>

                      <div className="dashboard-family-toggle mb-4">
                        <label className="form-label" htmlFor="familyType">
                          Profile type
                        </label>
                        <select
                          className="form-select"
                          id="familyType"
                          name="familyType"
                          value={profileDraft.familyType}
                          onChange={handleFamilyTypeChange}
                        >
                          <option value="single">Single baby</option>
                          <option value="twins">Twins</option>
                        </select>
                      </div>

                      <div className="row g-4">
                        {profileDraft.babies.map((profile, index) => (
                          <div
                            className={profileDraft.familyType === 'twins' ? 'col-lg-6' : 'col-12'}
                            key={getBabyLabel(profileDraft.familyType, index)}
                          >
                            <section className="dashboard-twin-editor-card h-100">
                              <div className="dashboard-twin-editor-header">
                                <span className="dashboard-section-card-label">Baby profile</span>
                                <h3 className="h5 mb-1">
                                  {getBabyLabel(profileDraft.familyType, index)}
                                </h3>
                                <p className="mb-0 text-muted">
                                  Save health details for appointments, growth tracking, and daily
                                  care.
                                </p>
                              </div>

                              <div className="row g-3">
                                <div className="col-12">
                                  <label className="form-label" htmlFor={`name-${index}`}>
                                    Baby name
                                  </label>
                                  <input
                                    className="form-control"
                                    id={`name-${index}`}
                                    name="name"
                                    type="text"
                                    value={profile.name}
                                    onChange={(event) => handleChange(index, event)}
                                    placeholder={`Enter ${getBabyLabel(profileDraft.familyType, index).toLowerCase()} name`}
                                  />
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label" htmlFor={`dob-${index}`}>
                                    Date of birth
                                  </label>
                                  <input
                                    className={`form-control${profileErrors[`${index}-dob`] ? ' is-invalid' : ''}`}
                                    id={`dob-${index}`}
                                    name="dob"
                                    type="date"
                                    value={profile.dob}
                                    onChange={(event) => handleChange(index, event)}
                                  />
                                  {profileErrors[`${index}-dob`] && (
                                    <div className="invalid-feedback d-block">
                                      {profileErrors[`${index}-dob`]}
                                    </div>
                                  )}
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label" htmlFor={`gender-${index}`}>
                                    Gender
                                  </label>
                                  <select
                                    className="form-select"
                                    id={`gender-${index}`}
                                    name="gender"
                                    value={profile.gender}
                                    onChange={(event) => handleChange(index, event)}
                                  >
                                    <option value="">Select</option>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                  </select>
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label" htmlFor={`weight-${index}`}>
                                    Weight
                                  </label>
                                  <input
                                    className="form-control"
                                    id={`weight-${index}`}
                                    name="weight"
                                    type="text"
                                    value={profile.weight}
                                    onChange={(event) => handleChange(index, event)}
                                    placeholder="e.g. 6.2 kg"
                                  />
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label" htmlFor={`height-${index}`}>
                                    Height
                                  </label>
                                  <input
                                    className="form-control"
                                    id={`height-${index}`}
                                    name="height"
                                    type="text"
                                    value={profile.height}
                                    onChange={(event) => handleChange(index, event)}
                                    placeholder="e.g. 62 cm"
                                  />
                                </div>
                              </div>
                            </section>
                          </div>
                        ))}

                        <div className="col-12">
                          <div className="d-flex flex-wrap gap-3">
                            <button
                              className="btn btn-primary"
                              type="submit"
                              disabled={hasSavedProfile && !hasChanges}
                            >
                              {saveButtonLabel}
                            </button>
                            {hasSavedProfile && (
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => {
                                  setProfileDraft(savedProfile)
                                  setHiddenTwinDraft(
                                    normalizeBabyProfile(savedProfile.babies[1] ?? emptyBabyProfile)
                                  )
                                  setIsEditing(false)
                                }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                          {hasSavedProfile && !hasChanges && (
                            <p className="dashboard-inline-hint mt-3 mb-0">
                              No changes to save yet. Update any field above to save again.
                            </p>
                          )}
                        </div>
                      </div>
                    </form>
                  ) : null}
                </>
              )}

              {isParentView && hasSavedProfile && !isEditing && (
                <section className="dashboard-saved-profile mt-4">
                  <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-3">
                    <div>
                      <span className="dashboard-section-card-label">Saved profile snapshot</span>
                      <h2 className="h5 mt-2 mb-1">
                        {savedProfile.familyType === 'twins'
                          ? 'Twin details ready for quick review'
                          : 'Baby details ready for quick review'}
                      </h2>
                      <p className="mb-0">Open the profile editor only when something actually changes.</p>
                    </div>
                    <span className="dashboard-save-badge">Up to date</span>
                  </div>

                  <div className="row g-3">
                    {savedProfile.babies.map((profile, index) => (
                      <div
                        className={savedProfile.familyType === 'twins' ? 'col-lg-6' : 'col-12'}
                        key={getBabyLabel(savedProfile.familyType, index)}
                      >
                        <article className="dashboard-twin-summary-card">
                          <div className="d-flex justify-content-between gap-3 align-items-start">
                            <div>
                              <span className="dashboard-section-card-label">
                                {getBabyLabel(savedProfile.familyType, index)}
                              </span>
                              <h3 className="h5 mt-2 mb-1">
                                {profile.name || getBabyLabel(savedProfile.familyType, index)}
                              </h3>
                              <p className="mb-0 text-muted">
                                {countFilledFields(profile)} of {profileFields.length} details saved
                              </p>
                            </div>
                            {hasProfileData(profile) && <span className="dashboard-save-badge">Saved</span>}
                          </div>

                          {hasProfileData(profile) ? (
                            <div className="row g-3 mt-1">
                              <div className="col-sm-6">
                                <article className="dashboard-profile-mini-card">
                                  <span className="dashboard-section-card-label">Name</span>
                                  <strong>{formatTextValue(profile.name)}</strong>
                                </article>
                              </div>
                              <div className="col-sm-6">
                                <article className="dashboard-profile-mini-card">
                                  <span className="dashboard-section-card-label">Date of birth</span>
                                  <strong>{formatLongDate(profile.dob)}</strong>
                                </article>
                              </div>
                              <div className="col-sm-6">
                                <article className="dashboard-profile-mini-card">
                                  <span className="dashboard-section-card-label">Gender</span>
                                  <strong>{formatTextValue(profile.gender)}</strong>
                                </article>
                              </div>
                              <div className="col-sm-6">
                                <article className="dashboard-profile-mini-card">
                                  <span className="dashboard-section-card-label">Weight</span>
                                  <strong>{formatTextValue(profile.weight)}</strong>
                                </article>
                              </div>
                              <div className="col-12">
                                <article className="dashboard-profile-mini-card">
                                  <span className="dashboard-section-card-label">Height</span>
                                  <strong>{formatTextValue(profile.height)}</strong>
                                </article>
                              </div>
                            </div>
                          ) : (
                            <div className="dashboard-profile-empty-state mt-3">
                              No details saved for{' '}
                              {getBabyLabel(savedProfile.familyType, index).toLowerCase()} yet.
                            </div>
                          )}
                        </article>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex flex-wrap gap-3 mt-4">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={handleOpenProfileEditor}
                    >
                      Update Profile
                    </button>
                    <Link className="btn btn-outline-primary" to="/dashboard/profile">
                      Open Full Profile
                    </Link>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="dashboard-toast" role="status" aria-live="polite">
          <strong>Saved</strong>
          <p className="mb-0">{toastMessage}</p>
        </div>
      )}
    </main>
  )
}

export default ParentDashboard
