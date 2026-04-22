import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLoggedInUser } from '../utils/navigation'
import { 
  setActivePatientEmail, 
  getActivePatientEmail 
} from '../utils/doctorNavigation'
import { getAvailableResources } from '../utils/resources'
import { shareResourceWithPatient } from '../utils/sharedResources'
import { getSavedAppointments, updateAppointmentStatus } from '../utils/appointments'
import { getDoctorByEmail } from '../utils/doctors'

const parseDate = (value) => {
  if (!value) return null
  const parsedDate = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

const calculateAge = (dob) => {
  const parsedDob = parseDate(dob)

  if (!parsedDob) {
    return 'Unknown'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const ageDays = Math.max(0, Math.floor((today - parsedDob) / 86400000))

  if (ageDays < 30) {
    return `${ageDays} day${ageDays === 1 ? '' : 's'}`
  }

  const months = Math.floor(ageDays / 30.4)
  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'}`
  }

  const years = Math.floor(months / 12)
  return `${years} year${years === 1 ? '' : 's'}`
}

const getLastVisit = (email) => {
  const appointments = getSavedAppointments(email)
  const latestAppointment = [...appointments].reverse().find((appointment) => appointment.appointmentDate)

  if (!latestAppointment) {
    return 'No visits yet'
  }

  const visitDate = latestAppointment.appointmentDate
  const visitTime = latestAppointment.appointmentTime ? ` at ${latestAppointment.appointmentTime}` : ''
  return `${visitDate}${visitTime}`
}

const getAllPatients = (doctorEmail) => {
  const profilePrefix = 'babyProfile:'
  const patients = []

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (key && key.startsWith(profilePrefix)) {
      const email = key.replace(profilePrefix, '')
      try {
        const data = JSON.parse(window.localStorage.getItem(key) || '{}')
        
        // Filter by primary doctor email
        if (doctorEmail && data.primaryDoctorEmail !== doctorEmail) {
          continue
        }

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

const getAllAppointmentsForDoctor = (doctorEmail, doctorName) => {
  const appointmentPrefix = 'babyAppointments:'
  const allAppointments = []

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (key && key.startsWith(appointmentPrefix)) {
      const email = key.replace(appointmentPrefix, '')
      try {
        const data = JSON.parse(window.localStorage.getItem(key) || '[]')
        if (Array.isArray(data)) {
          const matched = data
            .filter(appt => (doctorEmail && appt.doctorEmail === doctorEmail) || (appt.clinicName === doctorName))
            .map(appt => ({ ...appt, patientEmail: email }))
          allAppointments.push(...matched)
        }
      } catch (err) { }
    }
  }
  
  return allAppointments
}

const DoctorDashboard = () => {
  const navigate = useNavigate()
  const loggedInUser = getLoggedInUser()
  const [patients, setPatients] = useState([])
  const [resources, setResources] = useState([])
  const [toastMessage, setToastMessage] = useState('')
  const [activePatientEmail, setActivePatientEmailState] = useState(getActivePatientEmail())
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchedPatients = getAllPatients(loggedInUser?.email)
    setPatients(fetchedPatients)
    setResources(getAvailableResources())

    // Global aggregate for upcoming appointments (not just for primary patients)
    const doctorProfile = getDoctorByEmail(loggedInUser?.email)
    if (doctorProfile) {
      const allMatchedAppointments = getAllAppointmentsForDoctor(doctorProfile.email, doctorProfile.name)
      
      const now = new Date()
      const futureAppointments = allMatchedAppointments.filter(appt => {
        const apptDate = new Date(`${appt.appointmentDate}T00:00:00`)
        return apptDate >= new Date(now.setHours(0, 0, 0, 0))
      }).sort((a, b) => new Date(`${a.appointmentDate}T${a.appointmentTime || '00:00'}`) - new Date(`${b.appointmentDate}T${b.appointmentTime || '00:00'}`))

      setUpcomingAppointments(futureAppointments)
    }
  }, [loggedInUser?.email])

  useEffect(() => {
    if (!toastMessage) return

    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  const handleAccessChart = (email, babyName, appointmentId = null) => {
    setActivePatientEmail(email, { babyName })
    setActivePatientEmailState(email)

    // Trigger status update if accessed from a specific appointment slot
    if (appointmentId) {
      handleUpdateStatus(email, appointmentId, 'In-Progress')
    }

    navigate('/dashboard/prescription')
  }

  const handleShareResource = (email, resource) => {
    shareResourceWithPatient(email, resource)
    setToastMessage(`Recommended "${resource.title}" to ${email}`)
  }

  const handleClearContext = () => {
    setActivePatientEmail(null)
    setActivePatientEmailState(null)
  }

  const handleUpdateStatus = (patientEmail, appointmentId, newStatus) => {
    updateAppointmentStatus(appointmentId, newStatus, patientEmail)
    setToastMessage(`Visit marked as ${newStatus}`)
    // Refresh the list
    const doctorProfile = getDoctorByEmail(loggedInUser?.email)
    if (doctorProfile) {
        setUpcomingAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a))
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const todaysAgenda = upcomingAppointments.filter(a => a.appointmentDate === today && a.status !== 'Completed')
  const completedToday = upcomingAppointments.filter(a => a.appointmentDate === today && a.status === 'Completed').length

  const filteredPatients = patients.filter((patient) => {
    const childrenNames = patient.babies.map(b => b.name || 'Unnamed Baby').join(' & ')
    const searchString = `${patient.email} ${childrenNames}`.toLowerCase()
    return searchString.includes(searchTerm.toLowerCase())
  })

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
                  <span className="dashboard-section-label">Clinical Provider Workspace</span>
                  <h2 className="dashboard-section-title">Doctor Dashboard</h2>
                  <p className="dashboard-section-copy">
                    Manage your daily agenda, access patient charts, and coordinate care plans for assigned families.
                  </p>
                </div>
                {activePatientEmail && (
                  <button className="btn btn-outline-danger btn-sm mt-2" onClick={handleClearContext}>
                    Clear Active Patient
                  </button>
                )}
              </div>
            </div>

            <div className="row g-4 mb-4">
               <div className="col-md-4">
                  <article className="dashboard-section-card h-100 bg-primary text-white border-0">
                    <span className="text-white-50 small text-uppercase fw-bold">Daily Workload</span>
                    <h3 className="h2 mt-2">{todaysAgenda.length}</h3>
                    <p className="mb-0 opacity-75">Active visits for today</p>
                  </article>
               </div>
               <div className="col-md-4">
                  <article className="dashboard-section-card h-100 border-primary shadow-sm bg-light-subtle">
                    <span className="dashboard-section-card-label">List</span>
                    <h3 className="h2 mt-2 text-primary">{patients.length}</h3>
                    <p className="mb-0 text-muted">Families under your primary care</p>
                  </article>
               </div>
               <div className="col-md-4">
                  <article className="dashboard-section-card h-100 border-success shadow-sm bg-light-subtle">
                    <span className="text-success small text-uppercase fw-bold">Performance</span>
                    <h3 className="h2 mt-2 text-success">{completedToday}</h3>
                    <p className="mb-0 text-muted">Successful visits today</p>
                  </article>
               </div>
            </div>

            {activePatientEmail && (
              <div className="alert alert-warning d-flex align-items-center mb-5" role="alert" style={{ borderRadius: 12, border: '2px solid #ffc107' }}>
                <div className="py-1">
                  <i className="bi bi-person-fill-check me-2"></i>
                  <strong>Active Clinical Context:</strong> You are currently managing medical records for <code>{activePatientEmail}</code>.
                </div>
              </div>
            )}

            <section className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h5 mb-0 fw-bold">Today's Agenda</h3>
                  <span className="badge bg-primary px-3 rounded-pill">Real-time schedule</span>
                </div>
                {todaysAgenda.length === 0 ? (
                    <div className="dashboard-section-card text-center py-5 bg-light-subtle border-dashed">
                        <i className="bi bi-calendar-check text-muted h1"></i>
                        <p className="mt-3 text-muted mb-0">No active visits remaining for today.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle custom-table mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="ps-3">Time</th>
                            <th>Patient / Baby</th>
                            <th>Visit Type</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody className="border-top-0">
                          {todaysAgenda.map(appt => (
                            <tr key={appt.id}>
                              <td className="ps-3 fw-bold text-primary">{appt.appointmentTime || 'TBD'}</td>
                              <td>
                                <div className="fw-bold">{appt.babyName || 'Baby'}</div>
                                <div className="small text-muted">{appt.patientEmail}</div>
                              </td>
                              <td>
                                <span className="badge bg-light text-dark border me-1">{appt.visitType}</span>
                                {appt.status === 'In-Progress' && <span className="badge bg-warning-subtle text-warning border-warning">In-Progress</span>}
                                {appt.status === 'No-show' && <span className="badge bg-danger-subtle text-danger border-danger">No-show</span>}
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-primary btn-sm px-3" onClick={() => handleAccessChart(appt.patientEmail, appt.babyName, appt.id)}>
                                        {appt.status === 'In-Progress' ? 'Access Chart' : 'Start Visit'}
                                    </button>
                                    <button className="btn btn-outline-success btn-sm" title="Mark as Completed" onClick={() => handleUpdateStatus(appt.patientEmail, appt.id, 'Completed')}>
                                        <i className="bi bi-check-lg"></i>
                                    </button>
                                    {appt.status !== 'In-Progress' && (
                                        <button className="btn btn-outline-danger btn-sm" title="Mark as No-show" onClick={() => handleUpdateStatus(appt.patientEmail, appt.id, 'No-show')}>
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                )}
            </section>

            {toastMessage && (
              <div className="alert alert-success py-2 mb-4 d-flex align-items-center gap-2" style={{ borderRadius: 12 }}>
                <i className="bi bi-check-circle-fill"></i>
                <strong>Action Recorded:</strong> {toastMessage}
              </div>
            )}

            <section>
              <div className="d-flex justify-content-between align-items-center mb-3 mt-5">
                <h3 className="h5 mb-0 fw-bold">Patient Directory (List)</h3>
                <span className="text-muted small">{patients.length} Registered Families</span>
              </div>
            <section>
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 mt-5 gap-3">
                <div>
                  <h3 className="h5 mb-1 fw-bold">Patient Directory (List)</h3>
                  <span className="text-muted small">{filteredPatients.length} of {patients.length} Registered Families</span>
                </div>
                <div className="d-flex gap-2">
                  <div className="input-group input-group-sm" style={{ maxWidth: 300 }}>
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="search"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search accounts or dependants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ borderRadius: '0 10px 10px 0' }}
                    />
                  </div>
                </div>
              </div>

              {patients.length === 0 ? (
                <div className="dashboard-section-card bg-light">
                  <p className="mb-0 text-muted">No primary patients assigned yet.</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="dashboard-section-card text-center py-5 bg-light-subtle border-dashed">
                  <p className="text-muted mb-0">No matches found for "{searchTerm}". Try a different search term.</p>
                </div>
              ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle custom-table mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-3" style={{ minWidth: 220 }}>Family Account</th>
                                <th style={{ minWidth: 180 }}>Dependants</th>
                                <th style={{ minWidth: 140 }}>Clinical Profile</th>
                                <th style={{ minWidth: 160 }}>Last Visit</th>
                                <th className="text-end pe-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {filteredPatients.map((patient) => {
                                const childrenNames = patient.babies.map(b => b.name || 'Unnamed Baby').join(' & ')
                                const isCurrentlyActive = patient.email === activePatientEmail
                                const latestBaby = patient.babies[patient.babies.length - 1] ?? {}

                                return (
                                    <tr key={patient.email} className={isCurrentlyActive ? 'table-primary-subtle' : ''}>
                                        <td className="ps-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="flex-shrink-0">
                                                    <div className="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }}>
                                                        <i className="bi bi-person-fill text-primary"></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{patient.email}</div>
                                                    {isCurrentlyActive && (
                                                      <span className="badge bg-primary px-2 rounded-pill small" style={{ fontSize: '0.65rem' }}>Active Clinical Context</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="small text-muted mb-1">Assigned Children</div>
                                            <div className="fw-bold">{childrenNames || 'Setup Pending'}</div>
                                        </td>
                                        <td>
                                            <div className="small text-muted mb-1">Latest Records</div>
                                            <div className="d-flex gap-2">
                                                <span className="badge bg-light text-dark border fw-normal">{calculateAge(latestBaby.dob)}</span>
                                                <span className="badge bg-light text-dark border fw-normal">{latestBaby.weight || '-- kg'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="small text-muted mb-1">Recent Encounter</div>
                                            <div className="fw-bold small">{getLastVisit(patient.email)}</div>
                                        </td>
                                        <td className="text-end pe-3">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button 
                                                  className={`btn btn-sm px-3 ${isCurrentlyActive ? 'btn-primary' : 'btn-outline-primary'}`} 
                                                  style={{ borderRadius: 10 }}
                                                  onClick={() => handleAccessChart(patient.email, childrenNames)}
                                                >
                                                  {isCurrentlyActive ? 'Open Record' : 'Access Chart'}
                                                </button>
                                                
                                                <div className="dropdown">
                                                  <button className="btn btn-outline-secondary btn-sm px-2 dropdown-toggle-split" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ borderRadius: 10 }}>
                                                    <i className="bi bi-three-dots"></i>
                                                  </button>
                                                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0">
                                                    <li><h6 className="dropdown-header">Clinical Resources</h6></li>
                                                    {resources.length === 0 ? (
                                                        <li><span className="dropdown-item text-muted">No resources available</span></li>
                                                    ) : resources.map(resource => (
                                                      <li key={resource.id}>
                                                        <button className="dropdown-item d-flex justify-content-between align-items-center" onClick={() => handleShareResource(patient.email, resource)}>
                                                          <span>Recommend: {resource.title}</span>
                                                          <i className="bi bi-send-plus small opacity-50 ms-2"></i>
                                                        </button>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
              )}
            </section>
            </section>
          </section>
        </div>
      </div>
    </main>
  )
}

export default DoctorDashboard
