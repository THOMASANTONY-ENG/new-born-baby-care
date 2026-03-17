import React from 'react'
import { getLoggedInUser } from '../utils/navigation'

const roleMessages = {
  parent: 'You are viewing this section as a parent user.',
  doctor: 'You are viewing this section as a doctor user.',
  admin: 'You are viewing this section as an admin user.',
}

const DashboardSection = ({ title, description }) => {
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'

  return (
    <section className="dashboard-section-panel">
      <div className="dashboard-section-intro">
        <span className="dashboard-section-label">{role} view</span>
        <h2 className="dashboard-section-title">{title}</h2>
        <p className="dashboard-section-copy">{description}</p>
        <p className="dashboard-section-copy mb-0">{roleMessages[role]}</p>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <article className="dashboard-section-card h-100">
            <span className="dashboard-section-card-label">Current role</span>
            <h3>{role}</h3>
            <p className="mb-0">Logged in email: {loggedInUser?.email || 'No email found'}</p>
          </article>
        </div>

        <div className="col-md-6">
          <article className="dashboard-section-card h-100">
            <span className="dashboard-section-card-label">How it works</span>
            <h3>Email decides the role</h3>
            <p className="mb-0">
              `admin...` becomes admin, `doctor...` or `dr...` becomes doctor, and every
              other email becomes parent.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}

export default DashboardSection
