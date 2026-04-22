import React from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import '../components/style/parentdashboard.css'
import { getSavedBabyProfile } from '../utils/babyProfile'
import { getSavedAppointments } from '../utils/appointments'
import { getLoggedInUser } from '../utils/navigation'
import { getEffectiveUserEmail, getActivePatientEmail } from '../utils/doctorNavigation'
import ActivePatientBanner from '../components/ActivePatientBanner'

const hasProfileData = (profile = {}) => Object.values(profile).some(Boolean)
const parseDate = (value) => {
  if (!value) {
    return null
  }

  const parsedDate = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

const formatAge = (dob) => {
  const parsedDob = parseDate(dob)

  if (!parsedDob) {
    return 'Not available'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const ageDays = Math.max(0, Math.floor((today - parsedDob) / 86400000))

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

const formatLastVisit = (email) => {
  const appointments = getSavedAppointments(email)
  const latestAppointment = [...appointments].reverse().find((appointment) => appointment.appointmentDate)

  if (!latestAppointment) {
    return 'No visits yet'
  }

  return `${latestAppointment.appointmentDate}${
    latestAppointment.appointmentTime ? ` at ${latestAppointment.appointmentTime}` : ''
  }`
}

const getBabyLabel = (familyType, index) =>
  familyType === 'twins' ? `Twin ${index === 0 ? 'A' : 'B'}` : 'Baby'

const ViewBabyProfile = () => {
  const location = useLocation()
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'
  const isDoctor = role === 'doctor'
  const isAdmin = role === 'admin'
  const selectedEmail =
    isAdmin ? new URLSearchParams(location.search).get('email')?.trim().toLowerCase() ?? '' : ''
  const effectiveEmail = selectedEmail || getEffectiveUserEmail(loggedInUser)
  const savedProfile = getSavedBabyProfile(effectiveEmail)
  const familyType = savedProfile?.familyType === 'twins' ? 'twins' : 'single'
  const profiles = savedProfile?.babies ?? []
  const hasSavedProfiles = profiles.some((profile) => hasProfileData(profile))

  if (isDoctor && !getActivePatientEmail()) {
    return (
      <section className="dashboard-section-panel parent-dashboard-page">
        <div className="dashboard-section-intro">
          <span className="dashboard-section-label">Provider view</span>
          <h2 className="dashboard-section-title">No Patient Selected</h2>
          <p className="dashboard-section-copy">
            Please return to your patient list to select an active patient chart before viewing profile records.
          </p>
        </div>
        <div className="dashboard-section-card">
          <Link className="btn btn-primary" to="/dashboard">Return to Patient List</Link>
        </div>
      </section>
    )
  }

  if (!hasSavedProfiles) {
    return (
      <section className="dashboard-section-panel parent-dashboard-page">
        <div className="dashboard-section-intro">
          <span className="dashboard-section-label">Baby profile</span>
          <h2 className="dashboard-section-title">No baby profile found yet</h2>
          <p className="mb-0">
            Save your baby details from the parent dashboard to view them here.
          </p>
        </div>

        <div className="dashboard-section-card">
          <p className="mb-3">
            Once the profile is saved, this page will show the details for{' '}
            <strong>{loggedInUser?.email}</strong>.
          </p>
          <Link className="btn btn-primary" to="/dashboard">
            Go to Dashboard
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard-section-panel parent-dashboard-page">
      <ActivePatientBanner />
      <div className="dashboard-section-intro d-flex flex-wrap justify-content-between gap-3 align-items-start">
        <div>
          <span className="dashboard-section-label">Baby profile</span>
          <h2 className="dashboard-section-title">
            Saved details for {isDoctor || isAdmin ? 'this' : 'your'} {familyType === 'twins' ? 'twins' : 'baby'}
          </h2>
          <p className="mb-0">
            Review the saved profile linked to <strong>{effectiveEmail}</strong>.
          </p>
        </div>

        <Link className="btn btn-outline-primary" to="/dashboard">
          {isAdmin ? 'Back to Accounts' : 'Edit Profile'}
        </Link>
      </div>

      <div className="row g-4">
        {profiles.map((profile, index) => (
          <div className={familyType === 'twins' ? 'col-lg-6' : 'col-12'} key={`baby-${index + 1}`}>
            <article className="dashboard-twin-summary-card h-100">
              <div className="d-flex justify-content-between gap-3 align-items-start">
                <div>
                  <span className="dashboard-section-card-label">Saved baby</span>
                  <h3 className="h5 mt-2 mb-0">{getBabyLabel(familyType, index)}</h3>
                </div>
                {hasProfileData(profile) && <span className="dashboard-save-badge">Saved</span>}
              </div>

              {hasProfileData(profile) ? (
                <div className="row g-3 mt-1">
                  <div className="col-sm-6">
                    <article className="dashboard-profile-detail-card">
                      <span className="dashboard-section-card-label">Name</span>
                      <h3>{profile.name || 'Not provided'}</h3>
                    </article>
                  </div>
                  <div className="col-sm-6">
                    <article className="dashboard-profile-detail-card">
                      <span className="dashboard-section-card-label">Date of birth</span>
                      <h3>{profile.dob || 'Not provided'}</h3>
                    </article>
                  </div>
                  <div className="col-sm-6">
                    <article className="dashboard-profile-detail-card">
                      <span className="dashboard-section-card-label">Gender</span>
                      <h3>{profile.gender || 'Not provided'}</h3>
                    </article>
                  </div>
                  <div className="col-sm-6">
                    <article className="dashboard-profile-detail-card">
                      <span className="dashboard-section-card-label">Weight</span>
                      <h3>{profile.weight || 'Not provided'}</h3>
                    </article>
                  </div>
                  <div className="col-sm-6">
                    <article className="dashboard-profile-detail-card">
                      <span className="dashboard-section-card-label">Age</span>
                      <h3>{formatAge(profile.dob)}</h3>
                    </article>
                  </div>
                  <div className="col-12">
                    <article className="dashboard-profile-detail-card">
                      <span className="dashboard-section-card-label">Height</span>
                      <h3>{profile.height || 'Not provided'}</h3>
                    </article>
                  </div>
                  <div className="col-12">
                    <article className="dashboard-profile-detail-card">
                      <span className="dashboard-section-card-label">Last Visit</span>
                      <h3>{formatLastVisit(effectiveEmail)}</h3>
                    </article>
                  </div>
                </div>
              ) : (
                <div className="dashboard-profile-empty-state mt-3">
                  No details saved for {getBabyLabel(familyType, index).toLowerCase()} yet.
                </div>
              )}
            </article>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ViewBabyProfile
