import React from 'react'
import { Link } from 'react-router-dom'
import { getLoggedInUser } from '../utils/navigation'
import { getActivePatientEmail, setActivePatientEmail } from '../utils/doctorNavigation'

const ActivePatientBanner = () => {
  const loggedInUser = getLoggedInUser()
  const activeEmail = getActivePatientEmail()

  if (loggedInUser?.role !== 'doctor' || !activeEmail) {
    return null
  }

  return (
    <div className="alert alert-warning d-flex justify-content-between align-items-center mb-4 sticky-top shadow-sm" style={{ top: '60px', zIndex: 1000 }}>
      <div>
        <strong>⚕️ Clinical Override Active:</strong> Warning - You are viewing the medical record for <code>{activeEmail}</code>. Any changes made here will save directly to this patient's profile.
      </div>
      <Link 
        to="/dashboard" 
        className="btn btn-outline-danger btn-sm"
        onClick={() => setActivePatientEmail(null)}
      >
        Exit Patient Chart
      </Link>
    </div>
  )
}

export default ActivePatientBanner
