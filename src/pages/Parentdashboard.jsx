import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../components/style/parentdashboard.css'
import { getLoggedInUser } from '../utils/navigation'

const dashboardCards = [
  {
    title: 'Baby Profile',
    description: 'Review the baby details saved from your dashboard form.',
    button: 'View Profile',
    path: '/dashboard/profile',
  },
  {
    title: 'Vaccination Tracking',
    description: 'Monitor vaccine schedules and reminders.',
    button: 'Open Vaccination',
    path: '/dashboard/vaccination',
  },
  {
    title: 'Appointments',
    description: 'Check upcoming visits and follow-ups.',
    button: 'Open Appointments',
    path: '/dashboard/appointment',
  },
  {
    title: 'Growth Tracking',
    description: 'Track weight, height, and development.',
    button: 'Open Growth',
    path: '/dashboard/growth',
  },
  {
    title: 'Care Notes',
    description: 'Save daily updates and important reminders.',
    button: 'Open Notes',
    path: '/dashboard/notes',
  },
]

const roleTitles = {
  parent: 'Parent user',
  doctor: 'Doctor user',
  admin: 'Admin user',
}

const ParentDashboard = () => {
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'
  const [babyProfile, setBabyProfile] = useState({
    name: '',
    dob: '',
    gender: '',
    weight: '',
    height: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setBabyProfile((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    window.localStorage.setItem('babyProfile', JSON.stringify(babyProfile))
    window.alert('Baby profile saved')
  }

  return (
    <main className="container parent-dashboard-page">
      <div className="row g-4 align-items-start">
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100 dashboard-profile-card">
            <div className="card-body p-4">
              <span className="text-uppercase small text-muted">{roleTitles[role]}</span>
              <h1 className="h3 mt-2 mb-3">Simple dashboard</h1>
              <p className="text-muted mb-4">
                This page is intentionally simple so the login flow is easier to learn.
              </p>

              <div className="dashboard-section-card mb-4">
                <span className="dashboard-section-card-label">Logged-in account</span>
                <h3 className="h5">{loggedInUser?.email}</h3>
                <p className="mb-0">
                  Your email matched the <strong>{role}</strong> role.
                </p>
              </div>

              {role === 'parent' && (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label" htmlFor="name">
                        Baby name
                      </label>
                      <input
                        className="form-control"
                        id="name"
                        name="name"
                        type="text"
                        value={babyProfile.name}
                        onChange={handleChange}
                        placeholder="Enter baby name"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="dob">
                        Date of birth
                      </label>
                      <input
                        className="form-control"
                        id="dob"
                        name="dob"
                        type="date"
                        value={babyProfile.dob}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="gender">
                        Gender
                      </label>
                      <select
                        className="form-select"
                        id="gender"
                        name="gender"
                        value={babyProfile.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="weight">
                        Weight
                      </label>
                      <input
                        className="form-control"
                        id="weight"
                        name="weight"
                        type="text"
                        value={babyProfile.weight}
                        onChange={handleChange}
                        placeholder="e.g. 6.2 kg"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="height">
                        Height
                      </label>
                      <input
                        className="form-control"
                        id="height"
                        name="height"
                        type="text"
                        value={babyProfile.height}
                        onChange={handleChange}
                        placeholder="e.g. 62 cm"
                      />
                    </div>

                    <div className="col-12">
                      <button className="btn btn-primary" type="submit">
                        Save Profile
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="row g-4">
            {dashboardCards.map((card) => (
              <div className="col-md-6" key={card.title}>
                <div className="card shadow-sm border-0 h-100 dashboard-action-card">
                  <div className="card-body p-4 d-flex flex-column">
                    <h2 className="h5">{card.title}</h2>
                    <p className="text-muted flex-grow-1">{card.description}</p>
                    <Link className="btn btn-outline-primary" to={card.path}>
                      {card.button}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export default ParentDashboard
