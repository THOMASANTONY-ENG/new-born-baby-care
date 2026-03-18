import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../components/style/parentdashboard.css'
import { getLoggedInUser } from '../utils/navigation'
import { getSavedBabyProfile, saveBabyProfile } from '../utils/babyProfile'

const roleTitles = {
  parent: 'Parent user',
  doctor: 'Doctor user',
  admin: 'Admin user',
}

const ParentDashboard = () => {
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'
  const [babyProfile, setBabyProfile] = useState(() => getSavedBabyProfile(loggedInUser?.email) ?? {
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
    saveBabyProfile(babyProfile, loggedInUser?.email)
    window.alert('Baby profile saved')
  }

  return (
    <main className="container parent-dashboard-page">
      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-10">
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
                      <div className="d-flex flex-wrap gap-3">
                        <button className="btn btn-primary" type="submit">
                          Save Profile
                        </button>
                        <Link className="btn btn-outline-primary" to="/dashboard/profile">
                          View Saved Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ParentDashboard
