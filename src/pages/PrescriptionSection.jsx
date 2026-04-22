import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActivePatientEmail } from '../utils/doctorNavigation'
import { getLoggedInUser } from '../utils/navigation'
import { getPrescriptions, savePrescription, deletePrescription } from '../utils/prescriptions'
import ActivePatientBanner from '../components/ActivePatientBanner'
import '../components/style/parentdashboard.css'

const initialFormData = {
  medication: '',
  dosage: '',
  route: '',
  frequency: '',
  duration: '',
  instructions: '',
  warnings: '',
  followUp: '',
}

const formatPrescriptionDate = (value) => {
  if (!value) {
    return 'Date not available'
  }

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime())
    ? 'Date not available'
    : parsedDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
}

const getPrescriptionSummary = (prescriptions) => {
  if (!prescriptions.length) {
    return 'No instructions saved yet'
  }

  return `${prescriptions.length} active prescription${prescriptions.length === 1 ? '' : 's'}`
}

const PrescriptionCard = ({ prescription, onDelete }) => (
  <article className="prescription-record-card h-100">
    <div className="prescription-record-header">
      <div>
        <span className="dashboard-section-card-label prescription-meta-label">
          Prescribed on {formatPrescriptionDate(prescription.prescribedAt)}
        </span>
        <h3 className="h6 mt-2 mb-1">{prescription.medication || 'Medication not added'}</h3>
        <p className="mb-0 text-muted small">Follow the plan exactly as written below.</p>
      </div>
      <span className={`prescription-status-chip ${onDelete ? 'is-editable' : 'is-active'}`}>
        {onDelete ? 'Doctor view' : 'Active'}
      </span>
    </div>

    <div className="row g-2 mb-3">
      <div className="col-sm-6">
        <article className="prescription-mini-card h-100">
          <span className="dashboard-section-card-label">Dose</span>
          <strong>{prescription.dosage || 'Not added'}</strong>
        </article>
      </div>
      <div className="col-sm-6">
        <article className="prescription-mini-card h-100">
          <span className="dashboard-section-card-label">Route</span>
          <strong>{prescription.route || 'Not added'}</strong>
        </article>
      </div>
      <div className="col-sm-6">
        <article className="prescription-mini-card h-100">
          <span className="dashboard-section-card-label">Frequency</span>
          <strong>{prescription.frequency || 'Not added'}</strong>
        </article>
      </div>
      <div className="col-sm-6">
        <article className="prescription-mini-card h-100">
          <span className="dashboard-section-card-label">Duration</span>
          <strong>{prescription.duration || 'Not added'}</strong>
        </article>
      </div>
    </div>

    <article className="prescription-instructions-card prescription-instructions-card-compact">
      <div className="prescription-instructions-header">
        <span className="prescription-instructions-icon" aria-hidden="true">
          Rx
        </span>
        <div>
          <span className="dashboard-section-card-label">Medication instructions</span>
          <strong className="d-block prescription-instructions-title">How to give this medicine</strong>
        </div>
      </div>
      <p className="prescription-instructions-copy mb-0">
        {prescription.instructions || 'No extra instructions added.'}
      </p>
    </article>

    <div className="d-flex flex-column gap-2 small text-muted">
      {prescription.warnings ? (
        <div className="prescription-alert-box is-warning">
          <strong>Warning:</strong> {prescription.warnings}
        </div>
      ) : null}
      {prescription.followUp ? (
        <div className="prescription-alert-box is-followup">
          <strong>Follow-up:</strong> {prescription.followUp}
        </div>
      ) : null}
    </div>

    {onDelete ? (
      <div className="d-flex justify-content-end mt-3">
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => onDelete(prescription.id)}
        >
          Remove
        </button>
      </div>
    ) : null}
  </article>
)

const PrescriptionSection = () => {
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'
  const isDoctor = role === 'doctor'
  const patientEmail = isDoctor ? getActivePatientEmail() : loggedInUser?.email ?? ''
  const [prescriptions, setPrescriptions] = useState([])
  const [formData, setFormData] = useState(initialFormData)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    setPrescriptions(getPrescriptions(patientEmail))
  }, [patientEmail])

  useEffect(() => {
    if (!toastMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => setToastMessage(''), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key && !event.key.startsWith('babyPrescriptions:')) {
        return
      }

      setPrescriptions(getPrescriptions(patientEmail))
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [patientEmail])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!patientEmail) {
      return
    }

    const updatedPrescriptions = savePrescription(patientEmail, {
      ...formData,
      id: `rx-${Date.now()}`,
      prescribedAt: new Date().toISOString(),
    })

    setPrescriptions(updatedPrescriptions)
    setFormData(initialFormData)
    setToastMessage('Prescription issued successfully.')
  }

  const handleDelete = (prescriptionId) => {
    if (!window.confirm('Are you sure you want to remove this prescription?')) {
      return
    }

    const updatedPrescriptions = deletePrescription(patientEmail, prescriptionId)
    setPrescriptions(updatedPrescriptions)
    setToastMessage('Prescription removed.')
  }

  if (isDoctor && !patientEmail) {
    return (
      <section className="dashboard-section-panel parent-dashboard-page">
        <div className="dashboard-section-intro">
          <span className="dashboard-section-label">Clinical workspace</span>
          <h2 className="dashboard-section-title">No patient selected</h2>
          <p className="dashboard-section-copy">
            Select a patient from the doctor overview before issuing formal medical instructions.
          </p>
        </div>
        <div className="dashboard-section-card">
          <Link className="btn btn-primary" to="/dashboard">
            Return to Patient List
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard-section-panel parent-dashboard-page">
      {isDoctor ? <ActivePatientBanner /> : null}

      <div className="prescription-hero mb-4">
        <div className="dashboard-section-intro mb-0">
          <span className="dashboard-section-label">
            {isDoctor ? 'Clinical workspace' : 'Parent prescriptions'}
          </span>
          <h2 className="dashboard-section-title">
            {isDoctor ? 'Issue Medical Prescription' : 'Formal medical instructions'}
          </h2>
          <p className="dashboard-section-copy mb-0">
            {isDoctor
              ? 'Save clear medication instructions for the active patient. Parents will see the same record in their dashboard and prescription page.'
              : 'Review the latest prescription details, timing, warnings, and follow-up guidance shared for your family.'}
          </p>
        </div>

        <div className="prescription-hero-summary">
          <span className="dashboard-section-card-label">Current status</span>
          <strong>{getPrescriptionSummary(prescriptions)}</strong>
          <p className="mb-0 text-muted small">
            {isDoctor
              ? 'Each saved entry appears immediately in the patient account.'
              : 'Keep this page handy when giving medicine at home.'}
          </p>
        </div>
      </div>

      {toastMessage ? (
        <div className="alert alert-success py-2 mb-4">
          <strong>Success:</strong> {toastMessage}
        </div>
      ) : null}

      {isDoctor ? (
        <div className="row g-4">
          <div className="col-lg-5">
            <article className="prescription-form-shell h-100">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <span className="dashboard-section-card-label">New prescription</span>
                  <h3 className="h5 mt-2 mb-1">Write medication instructions</h3>
                </div>
                <span className="dashboard-save-badge">{prescriptions.length} saved</span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label" htmlFor="medication">
                      Medication name
                    </label>
                    <input
                      id="medication"
                      type="text"
                      name="medication"
                      className="form-control"
                      value={formData.medication}
                      onChange={handleInputChange}
                      placeholder="e.g. Paracetamol syrup"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="dosage">
                      Dosage
                    </label>
                    <input
                      id="dosage"
                      type="text"
                      name="dosage"
                      className="form-control"
                      value={formData.dosage}
                      onChange={handleInputChange}
                      placeholder="e.g. 5 mL"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="route">
                      Route
                    </label>
                    <input
                      id="route"
                      type="text"
                      name="route"
                      className="form-control"
                      value={formData.route}
                      onChange={handleInputChange}
                      placeholder="e.g. Oral"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="frequency">
                      Frequency
                    </label>
                    <input
                      id="frequency"
                      type="text"
                      name="frequency"
                      className="form-control"
                      value={formData.frequency}
                      onChange={handleInputChange}
                      placeholder="e.g. Every 6 hours"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="duration">
                      Duration
                    </label>
                    <input
                      id="duration"
                      type="text"
                      name="duration"
                      className="form-control"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g. 5 days"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label" htmlFor="instructions">
                      How to give this medicine
                    </label>
                    <textarea
                      id="instructions"
                      name="instructions"
                      className="form-control"
                      rows="3"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      placeholder="e.g. Give after feeds and complete the full course even if symptoms improve."
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label" htmlFor="warnings">
                      Warnings
                    </label>
                    <textarea
                      id="warnings"
                      name="warnings"
                      className="form-control"
                      rows="2"
                      value={formData.warnings}
                      onChange={handleInputChange}
                      placeholder="e.g. Stop and call if rash, breathing difficulty, or repeated vomiting occurs."
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label" htmlFor="followUp">
                      Follow-up
                    </label>
                    <input
                      id="followUp"
                      type="text"
                      name="followUp"
                      className="form-control"
                      value={formData.followUp}
                      onChange={handleInputChange}
                      placeholder="e.g. Review after 7 days or sooner if fever continues."
                    />
                  </div>

                  <div className="col-12">
                    <button type="submit" className="btn btn-primary w-100">
                      Issue Medical Instructions
                    </button>
                  </div>
                </div>
              </form>
            </article>
          </div>

          <div className="col-lg-7">
            <article className="prescription-history-shell h-100">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <span className="dashboard-section-card-label">Prescription history</span>
                  <h3 className="h5 mt-2 mb-1">Saved instructions</h3>
                </div>
                <span className="dashboard-save-badge">
                  {prescriptions.length} item{prescriptions.length === 1 ? '' : 's'}
                </span>
              </div>

              {prescriptions.length === 0 ? (
                <div className="dashboard-profile-empty-state">
                  No prescriptions have been issued for this patient yet.
                </div>
              ) : (
                <div className="row g-3">
                  {prescriptions.map((prescription) => (
                    <div className="col-12" key={prescription.id}>
                      <PrescriptionCard prescription={prescription} onDelete={handleDelete} />
                    </div>
                  ))}
                </div>
              )}
            </article>
          </div>
        </div>
      ) : prescriptions.length > 0 ? (
        <div className="row g-3">
          {prescriptions.map((prescription) => (
            <div className="col-lg-6" key={prescription.id}>
              <PrescriptionCard prescription={prescription} />
            </div>
          ))}
        </div>
      ) : (
        <div className="dashboard-section-card">
          <span className="dashboard-section-card-label">No prescription yet</span>
          <h3 className="h5 mt-2 mb-2">Your doctor has not issued instructions yet</h3>
          <p className="mb-0 text-muted">
            Once a prescription is saved for your account, the full medication plan will appear here automatically.
          </p>
        </div>
      )}
    </section>
  )
}

export default PrescriptionSection
