import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../components/style/parentdashboard.css'
import { getSavedBabyProfile } from '../utils/babyProfile'
import { getLoggedInUser } from '../utils/navigation'
import { getSavedGrowthLogs, saveGrowthLog } from '../utils/growthLogs'
import { getEffectiveUserEmail, getActivePatientEmail } from '../utils/doctorNavigation'
import ActivePatientBanner from '../components/ActivePatientBanner'

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

/** Format ISO date string "YYYY-MM-DD" → "28 Mar 2026" */
const formatDate = (value) => {
  if (!value) return 'No date'
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Extract numeric kg/cm from a string like "7.5 kg" → 7.5 */
const extractNum = (value) => {
  if (!value) return null
  const match = String(value).match(/([\d.]+)/)
  return match ? parseFloat(match[1]) : null
}

/** Pure-SVG growth chart for weight or height over time */
const GrowthChart = ({ logs, field, label, color, unit }) => {
  // logs newest-first, chart needs oldest-first
  const ordered = [...logs].reverse().slice(-8)
  const values = ordered.map((l) => extractNum(l[field]))
  const validValues = values.filter((v) => v !== null)

  if (validValues.length < 2) {
    return (
      <div style={{ padding: '18px', color: 'var(--text-soft)', fontSize: '0.9rem' }}>
        Add at least 2 records to see the {label.toLowerCase()} chart.
      </div>
    )
  }

  const W = 400
  const H = 120
  const PAD = { top: 16, right: 16, bottom: 28, left: 36 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const min = Math.min(...validValues)
  const max = Math.max(...validValues)
  const range = max - min || 1

  const xOf = (i) => PAD.left + (i / (ordered.length - 1)) * chartW
  const yOf = (v) => PAD.top + chartH - ((v - min) / range) * chartH

  const points = ordered
    .map((l, i) => {
      const v = extractNum(l[field])
      return v !== null ? { x: xOf(i), y: yOf(v), v, date: l.recordDate } : null
    })
    .filter(Boolean)

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ')
  // fill area
  const area = [
    `${points[0].x},${PAD.top + chartH}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${PAD.top + chartH}`,
  ].join(' ')

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: H, display: 'block' }}
        aria-label={`${label} growth chart`}
      >
        {/* grid lines */}
        {[0, 0.5, 1].map((t) => {
          const y = PAD.top + chartH * (1 - t)
          const val = (min + range * t).toFixed(1)
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="rgba(93,115,159,0.12)" strokeWidth="1" strokeDasharray="4 3" />
              <text x={PAD.left - 4} y={y + 4} textAnchor="end"
                fontSize="9" fill="rgba(93,115,159,0.7)">{val}</text>
            </g>
          )
        })}
        {/* area fill */}
        <polygon points={area} fill={color} opacity="0.12" />
        {/* line */}
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />
        {/* dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4.5" fill="#fff" stroke={color} strokeWidth="2" />
          </g>
        ))}
        {/* x-axis labels: first + last */}
        {[0, points.length - 1].map((i) => (
          <text key={i} x={points[i].x} y={H - 6} textAnchor="middle"
            fontSize="9" fill="rgba(93,115,159,0.7)">
            {formatDate(ordered[i].recordDate)}
          </text>
        ))}
      </svg>
    </div>
  )
}

const GrowthSection = () => {
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'
  const isDoctor = role === 'doctor'
  const effectiveEmail = getEffectiveUserEmail(loggedInUser)
  const savedProfile = getSavedBabyProfile(effectiveEmail)
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
  const [savedLogs, setSavedLogs] = useState(() => getSavedGrowthLogs(effectiveEmail))

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

    const nextSavedLogs = saveGrowthLog(nextLog, effectiveEmail)
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

  if (isDoctor && !getActivePatientEmail()) {
    return (
      <section className="dashboard-section-panel parent-dashboard-page">
        <div className="dashboard-section-intro">
          <span className="dashboard-section-label">Provider view</span>
          <h2 className="dashboard-section-title">No Patient Selected</h2>
          <p className="dashboard-section-copy">
            Please return to your patient list to select an active patient chart before updating growth records.
          </p>
        </div>
        <div className="dashboard-section-card">
          <Link className="btn btn-primary" to="/dashboard">Return to Patient List</Link>
        </div>
      </section>
    )
  }

  if (role === 'admin') {
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
      <ActivePatientBanner />
      <div className="dashboard-section-intro">
        <span className="dashboard-section-label">Growth</span>
        <h2 className="dashboard-section-title">Growth tracker for {isDoctor ? 'this' : 'your'} family</h2>
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
            <h3>{formatDate(latestRecordDate)}</h3>
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

          {savedLogs.length >= 2 && (
              <div className="mb-3">
                <span className="dashboard-section-card-label" style={{ display: 'block', marginBottom: 8 }}>Weight trend (kg)</span>
                <GrowthChart logs={savedLogs} field="weight" label="Weight" color="#5d739f" unit="kg" />
                <span className="dashboard-section-card-label" style={{ display: 'block', margin: '12px 0 8px' }}>Height trend (cm)</span>
                <GrowthChart logs={savedLogs} field="height" label="Height" color="#467165" unit="cm" />
              </div>
            )}
            {savedLogs.length ? (
              <div className="growth-log-list">
                {savedLogs.map((log) => (
                  <article className="growth-log-card" key={log.id}>
                    <div className="growth-log-header">
                      <div>
                        <span className="dashboard-section-card-label">{log.babyLabel}</span>
                        <h4>{log.babyName}</h4>
                      </div>
                      <span className="growth-chip">{formatDate(log.recordDate)}</span>
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
                            <strong>{formatDate(log.recordDate)}</strong>
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
