import React from 'react'
import { Link } from 'react-router-dom'
import '../components/style/parentdashboard.css'
import { getSavedBabyProfile } from '../utils/babyProfile'
import { getLoggedInUser } from '../utils/navigation'

const ViewBabyProfile = () => {
  const loggedInUser = getLoggedInUser()
  const profile = getSavedBabyProfile(loggedInUser?.email)

  if (!profile) {
    return (
      <section className="dashboard-section-panel parent-dashboard-page">
        <div className="dashboard-section-intro">
          <span className="dashboard-section-label">Baby profile</span>
          <h2 className="dashboard-section-title">No baby profile found yet</h2>
          <p className="mb-0">
            Save your baby&apos;s details from the parent dashboard to view them here.
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

  const profileFields = [
    { label: 'Name', value: profile.name },
    { label: 'Date of birth', value: profile.dob },
    { label: 'Gender', value: profile.gender },
    { label: 'Weight', value: profile.weight },
    { label: 'Height', value: profile.height },
  ]

  return (
    <section className="dashboard-section-panel parent-dashboard-page">
      <div className="dashboard-section-intro d-flex flex-wrap justify-content-between gap-3 align-items-start">
        <div>
          <span className="dashboard-section-label">Baby profile</span>
          <h2 className="dashboard-section-title">Saved details for your child</h2>
          <p className="mb-0">
            Review the profile linked to <strong>{loggedInUser?.email}</strong>.
          </p>
        </div>

        <Link className="btn btn-outline-primary" to="/dashboard">
          Edit Profile
        </Link>
      </div>

      <div className="row g-4">
        {profileFields.map((field) => (
          <div className="col-sm-6 col-lg-4" key={field.label}>
            <article className="dashboard-profile-detail-card h-100">
              <span className="dashboard-section-card-label">{field.label}</span>
              <h3>{field.value || 'Not provided'}</h3>
            </article>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ViewBabyProfile
