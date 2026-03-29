import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLoggedInUser } from '../utils/navigation'
import { 
  setActivePatientEmail, 
  getActivePatientEmail 
} from '../utils/doctorNavigation'
import { getAvailableResources } from '../utils/resources'
import { shareResourceWithPatient } from '../utils/sharedResources'

const getAllPatients = () => {
  const profilePrefix = 'babyProfile:'
  const patients = []

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (key && key.startsWith(profilePrefix)) {
      const email = key.replace(profilePrefix, '')
      try {
        const data = JSON.parse(window.localStorage.getItem(key) || '{}')
        if (data.babies) {
          const babies = data.babies.filter(b => b.name || b.dob)
          if (babies.length > 0) {
            patients.push({ email, babies })
          } else {
             // Uninitialized profile
            patients.push({ email, babies: [] })
          }
        } else if (data.name || data.dob) {
           patients.push({ email, babies: [data] })
        }
      } catch (err) {
        // Ignore malformed JSON
      }
    }
  }

  return patients
}

const DoctorDashboard = () => {
  const navigate = useNavigate()
  const loggedInUser = getLoggedInUser()
  const [patients, setPatients] = useState([])
  const [resources, setResources] = useState([])
  const [toastMessage, setToastMessage] = useState('')
  const [activePatientEmail, setActivePatientEmailState] = useState(getActivePatientEmail())

  useEffect(() => {
    setPatients(getAllPatients())
    setResources(getAvailableResources())
  }, [])

  useEffect(() => {
    if (!toastMessage) return

    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  const handleAccessChart = (email, babyName) => {
    setActivePatientEmail(email, { babyName })
    setActivePatientEmailState(email)
    navigate('/dashboard/appointment')
  }

  const handleShareResource = (email, resource) => {
    shareResourceWithPatient(email, resource)
    setToastMessage(`Prescribed "${resource.title}" to ${email}`)
  }

  const handleClearContext = () => {
    setActivePatientEmail(null)
    setActivePatientEmailState(null)
  }

  if (loggedInUser?.role !== 'doctor') {
    return (
       <div className="alert alert-danger m-4">Access Denied: Only doctors can view this page.</div>
    )
  }

  return (
    <main className="container parent-dashboard-page">
      <div className="row justify-content-center">
        <div className="col-xl-10">
          <section className="dashboard-section-panel mt-4">
            <div className="dashboard-section-intro mb-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="dashboard-section-label">Provider view</span>
                  <h2 className="dashboard-section-title">Patient List</h2>
                  <p className="dashboard-section-copy">
                    Select a patient chart to prescribe educational materials or manage appointments, growth logs, and vaccination histories.
                  </p>
                </div>
                {activePatientEmail && (
                  <button className="btn btn-outline-danger btn-sm mt-2" onClick={handleClearContext}>
                    Clear Active Patient
                  </button>
                )}
              </div>
            </div>

            {activePatientEmail && (
              <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
                <div>
                  <strong>Active Chart:</strong> You are currently viewing medical records for <code>{activePatientEmail}</code>.
                </div>
              </div>
            )}

            {toastMessage && (
              <div className="alert alert-success py-2 mb-4">
                <strong>Success:</strong> {toastMessage}
              </div>
            )}

            {patients.length === 0 ? (
              <div className="dashboard-section-card">
                <p className="mb-0">No registered parents built profile records in the system yet.</p>
              </div>
            ) : (
              <div className="row g-4 mb-5">
                {patients.map((patient) => {
                  const childrenNames = patient.babies.map(b => b.name || 'Unnamed Baby').join(' & ')
                  const isCurrentlyActive = patient.email === activePatientEmail

                  return (
                    <div className="col-12 col-xl-6" key={patient.email}>
                      <article className={`dashboard-section-card h-100 ${isCurrentlyActive ? 'border-primary shadow-sm' : ''}`}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <span className="dashboard-section-card-label">Family Account</span>
                            <h3 className="h5 mt-2 mb-1">{patient.email}</h3>
                            <p className="text-muted small mb-0 mt-2">
                              <strong>Dependants:</strong> {childrenNames || 'Setup Pending'}
                            </p>
                          </div>
                          {isCurrentlyActive && <span className="badge bg-primary">Active Chart</span>}
                        </div>

                        <div className="d-flex gap-2 flex-wrap mt-4">
                          <button 
                            className={`btn ${isCurrentlyActive ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                            onClick={() => handleAccessChart(patient.email, childrenNames)}
                          >
                            {isCurrentlyActive ? 'Go to Care Plan' : 'Access Chart'}
                          </button>
                          
                          <div className="dropdown">
                            <button className="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                              Prescribe Resource
                            </button>
                            <ul className="dropdown-menu shadow">
                              {resources.length === 0 ? (
                                  <li><span className="dropdown-item text-muted">No resources available</span></li>
                              ) : resources.map(resource => (
                                <li key={resource.id}>
                                  <button className="dropdown-item" onClick={() => handleShareResource(patient.email, resource)}>
                                    {resource.title}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </article>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export default DoctorDashboard
