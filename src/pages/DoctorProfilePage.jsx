import React, { useState, useMemo } from 'react'
import '../components/style/parentdashboard.css'
import { getLoggedInUser } from '../utils/navigation'
import { getDoctorByEmail, saveDoctor } from '../utils/doctors'

const getAllPatients = () => {
  const profilePrefix = 'babyProfile:'
  const sharedPrefix = 'babySharedResources:'
  const patients = []

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i)
    if (key && key.startsWith(profilePrefix)) {
      const email = key.replace(profilePrefix, '')
      try {
        const data = JSON.parse(window.localStorage.getItem(key) || '{}')
        const shared = (() => {
          try {
            return JSON.parse(window.localStorage.getItem(`${sharedPrefix}${email}`) || '[]')
          } catch {
            return []
          }
        })()
        const babies = data.babies?.filter((b) => b.name || b.dob) ?? []
        patients.push({ email, babies, sharedCount: shared.length })
      } catch {
        // ignore malformed
      }
    }
  }

  return patients
}

const DoctorProfilePage = () => {
  const loggedInUser = getLoggedInUser()
  const doctorProfile = useMemo(
    () => getDoctorByEmail(loggedInUser?.email ?? ''),
    [loggedInUser?.email]
  )
  const [displayName, setDisplayName] = useState(() => doctorProfile?.name ?? '')
  const [draftName, setDraftName] = useState(() => doctorProfile?.name ?? '')
  const [saved, setSaved] = useState(false)

  const patients = useMemo(() => getAllPatients(), [])

  if (loggedInUser?.role !== 'doctor') {
    return (
      <div className="alert alert-danger m-4">Access Denied: Only doctors can view this page.</div>
    )
  }

  const handleSave = (e) => {
    e.preventDefault()
    const trimmed = draftName.trim()
    saveDoctor({
      ...doctorProfile,
      email: loggedInUser.email,
      name: trimmed || doctorProfile?.name || 'Dr. Doctor',
    })
    setDisplayName(trimmed)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  const totalPrescribed = patients.reduce((sum, p) => sum + p.sharedCount, 0)

  return (
    <section className="dashboard-section-panel parent-dashboard-page">
      <div className="dashboard-section-intro">
        <span className="dashboard-section-label">Provider account</span>
        <h2 className="dashboard-section-title">My Profile</h2>
        <p className="dashboard-section-copy mb-0">
          View your account details and see a summary of care activity across your patient families.
        </p>
      </div>

      {/* Account card */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <article className="dashboard-section-card h-100">
            <span className="dashboard-section-card-label">Account information</span>
            <h3 className="h5 mt-2 mb-3">Doctor account</h3>

            <div className="row g-3 mb-4">
              <div className="col-12">
                <article className="dashboard-profile-mini-card">
                  <span className="dashboard-section-card-label">Email</span>
                  <strong>{loggedInUser.email}</strong>
                </article>
              </div>
              <div className="col-sm-6">
                <article className="dashboard-profile-mini-card">
                  <span className="dashboard-section-card-label">Role</span>
                  <strong style={{ textTransform: 'capitalize' }}>{loggedInUser.role}</strong>
                </article>
              </div>
              <div className="col-sm-6">
                <article className="dashboard-profile-mini-card">
                  <span className="dashboard-section-card-label">Doctor name</span>
                  <strong>{displayName || 'Not set'}</strong>
                </article>
              </div>
              <div className="col-sm-6">
                <article className="dashboard-profile-mini-card">
                  <span className="dashboard-section-card-label">Specialty</span>
                  <strong>{doctorProfile?.specialty || 'Pediatrician'}</strong>
                </article>
              </div>
              <div className="col-sm-6">
                <article className="dashboard-profile-mini-card">
                  <span className="dashboard-section-card-label">Rating</span>
                  <strong>
                    {Number.isFinite(Number(doctorProfile?.rating))
                      ? Number(doctorProfile.rating).toFixed(1)
                      : '4.5'}
                  </strong>
                </article>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label" htmlFor="doctor-display-name">
                  Update doctor name
                </label>
                <input
                  id="doctor-display-name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Dr. Anjali Mehta"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                />
              </div>
              <div className="d-flex align-items-center gap-3">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={draftName.trim() === displayName}
                >
                  Save profile
                </button>
                {saved && (
                  <span style={{ color: '#16a34a', fontSize: '0.875rem', fontWeight: 600 }}>
                    Saved
                  </span>
                )}
              </div>
            </form>
          </article>
        </div>

        <div className="col-lg-6">
          <div className="row g-3 h-100">
            <div className="col-sm-6">
              <article className="dashboard-care-status-card h-100">
                <span className="dashboard-section-card-label">Patients in system</span>
                <h3 className="h2 mt-2 mb-1" style={{ color: '#6339cb', fontWeight: 800 }}>
                  {patients.length}
                </h3>
                <p className="mb-0 text-muted small">
                  Family accounts with a saved baby profile.
                </p>
              </article>
            </div>
            <div className="col-sm-6">
              <article className="dashboard-care-status-card h-100">
                <span className="dashboard-section-card-label">Resources prescribed</span>
                <h3 className="h2 mt-2 mb-1" style={{ color: '#6339cb', fontWeight: 800 }}>
                  {totalPrescribed}
                </h3>
                <p className="mb-0 text-muted small">
                  Total reading materials shared with families.
                </p>
              </article>
            </div>
          </div>
        </div>
      </div>

      {/* Patient activity list */}
      <article className="dashboard-section-card">
        <span className="dashboard-section-card-label">Patient activity</span>
        <h3 className="h5 mt-2 mb-3">Families in your system</h3>

        {patients.length === 0 ? (
          <div className="dashboard-profile-empty-state">
            No parent accounts have saved baby profiles yet.
          </div>
        ) : (
          <div className="row g-3">
            {patients.map((patient) => {
              const childNames = patient.babies.map((b) => b.name || 'Unnamed').join(', ')
              return (
                <div className="col-md-6 col-xl-4" key={patient.email}>
                  <article
                    className="dashboard-profile-mini-card"
                    style={{ border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '1rem' }}
                  >
                    <span className="dashboard-section-card-label">Family account</span>
                    <strong className="d-block mt-1 mb-1" style={{ wordBreak: 'break-all', fontSize: '0.875rem' }}>
                      {patient.email}
                    </strong>
                    {patient.babies.length > 0 && (
                      <p className="mb-1 small text-muted">
                        <strong>Children:</strong> {childNames}
                      </p>
                    )}
                    <span
                      className="badge"
                      style={{
                        background: patient.sharedCount > 0 ? '#6339cb' : '#e5e7eb',
                        color: patient.sharedCount > 0 ? '#fff' : '#555',
                        fontSize: '0.72rem',
                      }}
                    >
                      {patient.sharedCount} resource{patient.sharedCount === 1 ? '' : 's'} prescribed
                    </span>
                  </article>
                </div>
              )
            })}
          </div>
        )}
      </article>
    </section>
  )
}

export default DoctorProfilePage
