import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../components/style/parentdashboard.css'
import { getSavedBabyProfile } from '../utils/babyProfile'
import { getLoggedInUser } from '../utils/navigation'
import { getSavedGrowthLogs, saveGrowthLog } from '../utils/growthLogs'

const getBabyLabel = (familyType, index) =>
  familyType === 'twins' ? `Twin ${index === 0 ? 'A' : 'B'}` : 'Baby'

const hasProfileData = (profile = {}) => Object.values(profile).some(Boolean)

const parseDate = (value) => {
  if (!value) {
    return null
  }

  const parsedDate = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

const calculateAgeDays = (dob) => {
  const parsedDob = parseDate(dob)

  if (!parsedDob) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Math.max(0, Math.floor((today - parsedDob) / 86400000))
}

const formatAge = (ageDays) => {
  if (ageDays === null) {
    return 'Date of birth needed'
  }

  if (ageDays < 30) {
    return `${ageDays} day${ageDays === 1 ? '' : 's'} old`
  }

  const months = Math.floor(ageDays / 30.4)

  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} old`
  }

  const years = Math.floor(months / 12)
  return `${years} year${years === 1 ? '' : 's'} old`
}

const formatMeasurement = (value, unit, fallback = 'Not provided') => {
  if (!value) {
    return fallback
  }

  return /\d/.test(value) ? `${value} ${unit}` : value
}

const getTodayDate = () => {
  const today = new Date()
  const month = `${today.getMonth() + 1}`.padStart(2, '0')
  const day = `${today.getDate()}`.padStart(2, '0')

  return `${today.getFullYear()}-${month}-${day}`
}

const GrowthSection = () => {
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'
  const savedProfile = getSavedBabyProfile(loggedInUser?.email)
  const familyType = savedProfile?.familyType === 'twins' ? 'twins' : 'single'
  const babies = savedProfile?.babies ?? []
  const availableBabies = babies.filter((profile) => hasProfileData(profile))
  const babySummaries = availableBabies.map((profile, index) => ({
    profile,
    label: getBabyLabel(familyType, index),
    displayName: profile.name || getBabyLabel(familyType, index),
    age: formatAge(calculateAgeDays(profile.dob)),
  }))
  const [toastMessage, setToastMessage] = useState('')
  const [growthForm, setGrowthForm] = useState(() => ({
    babyLabel: babySummaries[0]?.label ?? '',
    recordDate: getTodayDate(),
    weight: '',
    height: '',
    note: '',
  }))
  const [savedLogs, setSavedLogs] = useState(() => getSavedGrowthLogs(loggedInUser?.email))

  useEffect(() => {
    if (!toastMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 2800)

    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  const handleGrowthChange = (event) => {
    const { name, value } = event.target

    setGrowthForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSaveGrowth = (event) => {
    event.preventDefault()

    const selectedBaby =
      babySummaries.find((baby) => baby.label === growthForm.babyLabel) ?? babySummaries[0]

    const nextLog = {
      id: `${Date.now()}`,
      babyLabel: growthForm.babyLabel,
      babyName: selectedBaby?.displayName ?? growthForm.babyLabel,
      recordDate: growthForm.recordDate,
      weight: growthForm.weight,
      height: growthForm.height,
      note: growthForm.note,
    }

    const nextSavedLogs = saveGrowthLog(nextLog, loggedInUser?.email)
    setSavedLogs(nextSavedLogs)
    setGrowthForm({
      babyLabel: babySummaries[0]?.label ?? '',
      recordDate: getTodayDate(),
      weight: '',
      height: '',
      note: '',
    })
    setToastMessage('Growth entry saved successfully.')
  }

  if (role !== 'parent') {
    return (
      <section className="dashboard-section-panel parent-dashboard-page">
        <div className="dashboard-section-intro">
          <span className="dashboard-section-label">{role} view</span>
          <h2 className="dashboard-section-title">Growth Tracking</h2>
          <p className="dashboard-section-copy">
            This section is designed for parents and uses the saved baby profile to track height
            and weight updates.
          </p>
        </div>

        <div className="dashboard-section-card">
          <p className="mb-3">Sign in with a parent account to track growth records.</p>
          <p className="mb-0">Current account: {loggedInUser?.email || 'No email found'}</p>
        </div>
      </section>
    )
  }

  if (!availableBabies.length) {
    return (
      <section className="dashboard-section-panel parent-dashboard-page">
        <div className="dashboard-section-intro">
          <span className="dashboard-section-label">Growth</span>
          <h2 className="dashboard-section-title">Add a baby profile first</h2>
          <p className="dashboard-section-copy mb-0">
            Save your baby profile so the growth section can track weight and height updates.
          </p>
        </div>

        <div className="dashboard-section-card">
          <p className="mb-3">
            Once the profile is saved, this page will help you keep growth records in one place.
          </p>
          <Link className="btn btn-primary" to="/dashboard">
            Go to Dashboard
          </Link>
        </div>
      </section>
    )
  }

  const latestRecordDate = savedLogs[0]?.recordDate ?? 'No records yet'

  return (
    <section className="dashboard-section-panel parent-dashboard-page growth-page">
      <div className="dashboard-section-intro">
        <span className="dashboard-section-label">Growth</span>
        <h2 className="dashboard-section-title">Growth tracker for your family</h2>
        <p className="dashboard-section-copy mb-0">
          Save weight and height records regularly so parents can follow each baby&apos;s growth
          clearly.
        </p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <article className="growth-guide-card h-100">
            <span className="growth-guide-step">Step 1</span>
            <h3>Add one record at a time</h3>
            <p className="mb-0">
              Save the date, weight, and height after each clinic visit or home check.
            </p>
          </article>
        </div>

        <div className="col-lg-4">
          <article className="growth-guide-card h-100">
            <span className="growth-guide-step">Step 2</span>
            <h3>Read labeled values</h3>
            <p className="mb-0">
              Every saved record now shows clear labels like Weight and Height instead of short
              number pairs.
            </p>
          </article>
        </div>

        <div className="col-lg-4">
          <article className="growth-guide-card h-100">
            <span className="growth-guide-step">Step 3</span>
            <h3>Compare recent updates</h3>
            <p className="mb-0">
              Review the latest entries for each baby to spot changes more easily.
            </p>
          </article>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <article className="growth-summary-card h-100">
            <span className="dashboard-section-card-label">Profile type</span>
            <h3>{familyType === 'twins' ? 'Twins growth plan' : 'Single baby growth plan'}</h3>
            <p className="mb-0">
              Tracking {availableBabies.length} saved {availableBabies.length === 1 ? 'baby' : 'babies'}.
            </p>
          </article>
        </div>

        <div className="col-md-4">
          <article className="growth-summary-card h-100">
            <span className="dashboard-section-card-label">Saved records</span>
            <h3>{savedLogs.length}</h3>
            <p className="mb-0">Each entry helps you compare recent growth updates over time.</p>
          </article>
        </div>

        <div className="col-md-4">
          <article className="growth-summary-card h-100">
            <span className="dashboard-section-card-label">Latest update</span>
            <h3>{latestRecordDate}</h3>
            <p className="mb-0">Record weight and height after checkups or routine measurements.</p>
          </article>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-5">
          <article className="growth-form-card h-100">
            <span className="dashboard-section-card-label">Add growth record</span>
            <h3 className="growth-form-title">Save a new weight and height entry</h3>
            <p className="mb-4">
              Parents can add a new growth update after each visit or home measurement.
            </p>

            <form onSubmit={handleSaveGrowth}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="babyLabel">
                    Select baby
                  </label>
                  <select
                    className="form-select"
                    id="babyLabel"
                    name="babyLabel"
                    value={growthForm.babyLabel}
                    onChange={handleGrowthChange}
                    required
                  >
                    {babySummaries.map((baby) => (
                      <option key={baby.label} value={baby.label}>
                        {baby.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="recordDate">
                    Record date
                  </label>
                  <input
                    className="form-control"
                    id="recordDate"
                    name="recordDate"
                    type="date"
                    value={growthForm.recordDate}
                    onChange={handleGrowthChange}
                    max={getTodayDate()}
                    required
                  />
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
                    value={growthForm.weight}
                    onChange={handleGrowthChange}
                    placeholder="e.g. 6.8 kg"
                    required
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
                    value={growthForm.height}
                    onChange={handleGrowthChange}
                    placeholder="e.g. 64 cm"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="note">
                    Notes
                  </label>
                  <textarea
                    className="form-control"
                    id="note"
                    name="note"
                    rows="3"
                    value={growthForm.note}
                    onChange={handleGrowthChange}
                    placeholder="Add feeding, sleep, or doctor notes"
                  />
                </div>

                <div className="col-12">
                  <button className="btn btn-primary" type="submit">
                    Save Growth Entry
                  </button>
                </div>
              </div>
            </form>
          </article>
        </div>

        <div className="col-xl-7">
          <article className="growth-form-card h-100">
            <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-3">
              <div>
                <span className="dashboard-section-card-label">Recent growth records</span>
                <h3 className="growth-form-title">Saved growth history</h3>
              </div>
              <span className="growth-badge">
                {savedLogs.length} entr{savedLogs.length === 1 ? 'y' : 'ies'}
              </span>
            </div>

            {savedLogs.length ? (
              <div className="growth-log-list">
                {savedLogs.map((log) => (
                  <article className="growth-log-card" key={log.id}>
                    <div className="growth-log-header">
                      <div>
                        <span className="dashboard-section-card-label">{log.babyLabel}</span>
                        <h4>{log.babyName}</h4>
                      </div>
                      <span className="growth-chip">{log.recordDate}</span>
                    </div>

                    <div className="growth-log-meta">
                      <span>Weight: {formatMeasurement(log.weight, 'kg')}</span>
                      <span>Height: {formatMeasurement(log.height, 'cm')}</span>
                    </div>

                    {log.note && <p className="mb-0">{log.note}</p>}
                  </article>
                ))}
              </div>
            ) : (
              <div className="dashboard-profile-empty-state">
                No growth entries saved yet. Use the form to add the first record.
              </div>
            )}
          </article>
        </div>
      </div>

      <div className="row g-4">
        {babySummaries.map((baby) => {
          const babyLogs = savedLogs.filter((log) => log.babyLabel === baby.label).slice(0, 3)

          return (
            <div className={familyType === 'twins' ? 'col-xl-6' : 'col-12'} key={baby.label}>
              <article className="growth-baby-card h-100">
                <div className="growth-baby-header">
                  <div>
                    <span className="dashboard-section-card-label">{baby.label}</span>
                    <h3>{baby.displayName}</h3>
                  </div>
                  <span className="growth-badge">{baby.age}</span>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <article className="dashboard-profile-mini-card">
                      <span className="dashboard-section-card-label">Current saved weight</span>
                      <strong>{formatMeasurement(baby.profile.weight, 'kg')}</strong>
                    </article>
                  </div>
                  <div className="col-sm-6">
                    <article className="dashboard-profile-mini-card">
                      <span className="dashboard-section-card-label">Current saved height</span>
                      <strong>{formatMeasurement(baby.profile.height, 'cm')}</strong>
                    </article>
                  </div>
                </div>

                <article className="growth-stage-card">
                  <span className="dashboard-section-card-label">Recent records</span>
                  <h4>Latest growth entries</h4>
                  {babyLogs.length ? (
                    <div className="growth-log-list">
                      {babyLogs.map((log) => (
                        <article className="growth-log-card" key={log.id}>
                          <div className="growth-log-header">
                            <strong>{log.recordDate}</strong>
                          </div>
                          <div className="growth-record-measurements">
                            <span className="growth-measure-chip">
                              Weight: {formatMeasurement(log.weight, 'kg')}
                            </span>
                            <span className="growth-measure-chip">
                              Height: {formatMeasurement(log.height, 'cm')}
                            </span>
                          </div>
                          {log.note && <p className="mb-0">{log.note}</p>}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="dashboard-profile-empty-state mt-2">
                      No recent growth records for {baby.label.toLowerCase()} yet.
                    </div>
                  )}
                </article>
              </article>
            </div>
          )
        })}
      </div>

      {toastMessage && (
        <div className="dashboard-toast" role="status" aria-live="polite">
          <strong>Saved</strong>
          <p className="mb-0">{toastMessage}</p>
        </div>
      )}
    </section>
  )
}

export default GrowthSection
