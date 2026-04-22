import React, { useEffect, useState } from 'react'
import '../components/style/parentdashboard.css'
import { 
  getAllAppointments, 
  updateAppointmentStatus, 
  deleteAppointment 
} from '../utils/appointments'

const AdminAppointmentsSection = () => {
  const [allAppointments, setAllAppointments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    setAllAppointments(getAllAppointments())
  }, [])

  useEffect(() => {
    if (!toastMessage) return
    const timeoutId = window.setTimeout(() => setToastMessage(''), 2800)
    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  const filteredAppointments = allAppointments.filter(appt => {
    const searchStr = `${appt.parentEmail} ${appt.clinicName} ${appt.babyName} ${appt.visitType}`.toLowerCase()
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || appt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = (appt, newStatus) => {
    const nextAppts = updateAppointmentStatus(appt.id, newStatus, appt.parentEmail)
    setAllAppointments(getAllAppointments()) // Re-fetch for unified view
    setToastMessage(`Status updated to ${newStatus}`)
  }

  const handleDelete = (appt) => {
    if (window.confirm('Are you sure you want to delete this appointment record?')) {
      deleteAppointment(appt.id, appt.parentEmail)
      setAllAppointments(getAllAppointments())
      setToastMessage('Appointment record removed')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      'Scheduled': 'bg-primary-subtle text-primary',
      'In-Progress': 'bg-warning-subtle text-warning-emphasis',
      'Completed': 'bg-success-subtle text-success',
      'No-show': 'bg-danger-subtle text-danger'
    }
    return <span className={`badge ${styles[status] || 'bg-secondary-subtle text-secondary'} px-2 rounded-pill small`}>{status}</span>
  }

  return (
    <section className="dashboard-section-panel parent-dashboard-page">
      <div className="dashboard-overview-hero mb-4">
        <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
          <div>
            <span className="dashboard-section-card-label">System-wide Control</span>
            <h2 className="h3 mt-2 mb-3">Master Appointment Directory</h2>
            <p className="mb-0 text-muted">
              Oversee every scheduled visit across the platform. Manage clinical statuses and review family care plans.
            </p>
          </div>
          <div className="dashboard-overview-status">
            <span className="dashboard-save-badge">{allAppointments.length} Total Bookings</span>
            <p className="mb-0">Visibility into all parent-booked sessions.</p>
          </div>
        </div>
      </div>

      <article className="dashboard-twin-summary-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div className="d-flex gap-3">
            <div className="input-group input-group-sm" style={{ maxWidth: 300 }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="search"
                className="form-control border-start-0 ps-0"
                placeholder="Search patient or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="form-select form-select-sm" 
              style={{ width: 160 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Completed">Completed</option>
              <option value="No-show">No-show</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle custom-table mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Patient Account</th>
                <th>Doctor / Clinic</th>
                <th>Schedule</th>
                <th>Status</th>
                <th className="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No appointments found matching the current criteria.
                  </td>
                </tr>
              ) : filteredAppointments.map((appt) => (
                <tr key={appt.id}>
                  <td className="ps-3">
                    <div className="fw-bold text-dark">{appt.parentEmail}</div>
                    <div className="small text-muted">{appt.babyName || appt.babyLabel}</div>
                  </td>
                  <td>
                    <div className="fw-bold">{appt.clinicName}</div>
                    <div className="small text-muted">{appt.visitType}</div>
                  </td>
                  <td>
                    <div className="fw-bold small">{appt.appointmentDate}</div>
                    <div className="text-muted small">{appt.appointmentTime}</div>
                  </td>
                  <td>{getStatusBadge(appt.status)}</td>
                  <td className="text-end pe-3">
                    <div className="dropdown d-inline-block">
                      <button className="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        Manage
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0">
                        <li><h6 className="dropdown-header">Clinical Status</h6></li>
                        <li><button className="dropdown-item" onClick={() => handleUpdateStatus(appt, 'Scheduled')}>Mark Scheduled</button></li>
                        <li><button className="dropdown-item" onClick={() => handleUpdateStatus(appt, 'In-Progress')}>Mark In-Progress</button></li>
                        <li><button className="dropdown-item" onClick={() => handleUpdateStatus(appt, 'Completed')}>Mark Completed</button></li>
                        <li><button className="dropdown-item" onClick={() => handleUpdateStatus(appt, 'No-show')}>Mark No-show</button></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><button className="dropdown-item text-danger" onClick={() => handleDelete(appt)}>Delete Record</button></li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {toastMessage && (
        <div className="dashboard-toast" role="status" aria-live="polite">
          <strong>System Update</strong>
          <p className="mb-0">{toastMessage}</p>
        </div>
      )}
    </section>
  )
}

export default AdminAppointmentsSection
