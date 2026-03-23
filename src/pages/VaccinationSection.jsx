import React from 'react'
import { Link } from 'react-router-dom'
import '../components/style/parentdashboard.css'
import { getSavedBabyProfile } from '../utils/babyProfile'
import { getLoggedInUser } from '../utils/navigation'

const vaccineMilestones = [
  {
    ageLabel: 'Birth',
    minAgeDays: 0,
    nextMilestoneDays: 42,
    note: 'At birth or as early as possible.',
    vaccines: [
      {
        name: 'BCG',
        timing: 'At birth or as early as possible till one year of age',
        dose: '0.1 ml (0.05 ml until 1 month age)',
        route: 'Intra-dermal',
        site: 'Left upper arm',
      },
      {
        name: 'Hepatitis B - Birth dose',
        timing: 'At birth or as early as possible within 24 hours',
        dose: '0.5 ml',
        route: 'Intra-muscular',
        site: 'Antero-lateral side of mid-thigh',
      },
      {
        name: 'OPV-0',
        timing: 'At birth or as early as possible within the first 15 days',
        dose: '2 drops',
        route: 'Oral',
        site: 'Oral',
      },
    ],
  },
  {
    ageLabel: '6 weeks',
    minAgeDays: 42,
    nextMilestoneDays: 70,
    note: 'First primary immunization visit.',
    vaccines: [
      {
        name: 'OPV-1',
        timing: 'At 6 weeks',
        dose: '2 drops',
        route: 'Oral',
        site: 'Oral',
      },
      {
        name: 'Pentavalent-1',
        timing: 'At 6 weeks',
        dose: '0.5 ml',
        route: 'Intra-muscular',
        site: 'Antero-lateral side of mid-thigh',
      },
      {
        name: 'Rotavirus-1',
        timing: 'At 6 weeks',
        dose: '5 drops',
        route: 'Oral',
        site: 'Oral',
      },
      {
        name: 'IPV fractional dose-1',
        timing: 'At 6 weeks',
        dose: '0.1 ml',
        route: 'Intra-dermal',
        site: 'Right upper arm',
      },
      {
        name: 'PCV-1',
        timing: 'At 6 weeks in selected states and districts',
        dose: '0.5 ml',
        route: 'Intra-muscular',
        site: 'Antero-lateral side of mid-thigh',
      },
    ],
  },
  {
    ageLabel: '10 weeks',
    minAgeDays: 70,
    nextMilestoneDays: 98,
    note: 'Second primary immunization visit.',
    vaccines: [
      {
        name: 'OPV-2',
        timing: 'At 10 weeks',
        dose: '2 drops',
        route: 'Oral',
        site: 'Oral',
      },
      {
        name: 'Pentavalent-2',
        timing: 'At 10 weeks',
        dose: '0.5 ml',
        route: 'Intra-muscular',
        site: 'Antero-lateral side of mid-thigh',
      },
      {
        name: 'Rotavirus-2',
        timing: 'At 10 weeks',
        dose: '5 drops',
        route: 'Oral',
        site: 'Oral',
      },
    ],
  },
  {
    ageLabel: '14 weeks',
    minAgeDays: 98,
    nextMilestoneDays: 270,
    note: 'Third primary immunization visit.',
    vaccines: [
      {
        name: 'OPV-3',
        timing: 'At 14 weeks',
        dose: '2 drops',
        route: 'Oral',
        site: 'Oral',
      },
      {
        name: 'Pentavalent-3',
        timing: 'At 14 weeks',
        dose: '0.5 ml',
        route: 'Intra-muscular',
        site: 'Antero-lateral side of mid-thigh',
      },
      {
        name: 'Rotavirus-3',
        timing: 'At 14 weeks',
        dose: '5 drops',
        route: 'Oral',
        site: 'Oral',
      },
      {
        name: 'IPV fractional dose-2',
        timing: 'At 14 weeks',
        dose: '0.1 ml',
        route: 'Intra-dermal',
        site: 'Right upper arm',
      },
      {
        name: 'PCV-2',
        timing: 'At 14 weeks in selected states and districts',
        dose: '0.5 ml',
        route: 'Intra-muscular',
        site: 'Antero-lateral side of mid-thigh',
      },
    ],
  },
  {
    ageLabel: '9 to 12 months',
    minAgeDays: 270,
    nextMilestoneDays: 480,
    note: 'First measles, JE, and Vitamin A stage.',
    vaccines: [
      {
        name: 'MR-1',
        timing: '9 completed months to 12 months',
        dose: '0.5 ml',
        route: 'Sub-cutaneous',
        site: 'Right upper arm',
      },
      {
        name: 'JE-1',
        timing: '9 completed months to 12 months',
        dose: '0.5 ml',
        route: 'Sub-cutaneous',
        site: 'Left upper arm',
      },
      {
        name: 'Vitamin A 1st dose',
        timing: 'At 9 completed months with Measles / MR',
        dose: '1 ml (1 lakh IU)',
        route: 'Oral',
        site: 'Oral',
      },
      {
        name: 'PCV booster',
        timing: '9 to 12 months in selected states and districts',
        dose: '0.5 ml',
        route: 'Intra-muscular',
        site: 'Antero-lateral side of mid-thigh',
      },
    ],
  },
  {
    ageLabel: '16 to 24 months',
    minAgeDays: 480,
    nextMilestoneDays: 1825,
    note: 'Booster stage for early childhood.',
    vaccines: [
      {
        name: 'DPT booster-1',
        timing: '16 to 24 months',
        dose: '0.5 ml',
        route: 'Intra-muscular',
        site: 'Antero-lateral side of mid-thigh',
      },
      {
        name: 'MR-2',
        timing: '16 to 24 months',
        dose: '0.5 ml',
        route: 'Sub-cutaneous',
        site: 'Right upper arm',
      },
      {
        name: 'OPV booster',
        timing: '16 to 24 months',
        dose: '2 drops',
        route: 'Oral',
        site: 'Oral',
      },
      {
        name: 'JE-2',
        timing: '16 to 24 months',
        dose: '0.5 ml',
        route: 'Sub-cutaneous',
        site: 'Left upper arm',
      },
      {
        name: 'Vitamin A 2nd to 9th dose',
        timing: '16 to 18 months, then every 6 months up to 5 years',
        dose: '2 ml (2 lakh IU)',
        route: 'Oral',
        site: 'Oral',
      },
    ],
  },
  {
    ageLabel: '5 to 6 years',
    minAgeDays: 1825,
    nextMilestoneDays: 3650,
    note: 'School-age booster visit.',
    vaccines: [
      {
        name: 'DPT booster-2',
        timing: '5 to 6 years',
        dose: '0.5 ml',
        route: 'Intra-muscular',
        site: 'Upper arm',
      },
    ],
  },
  {
    ageLabel: '10 years and 16 years',
    minAgeDays: 3650,
    nextMilestoneDays: null,
    note: 'Later adolescent booster stages.',
    vaccines: [
      {
        name: 'Td',
        timing: 'At 10 years and again at 16 years',
        dose: '0.5 ml',
        route: 'Intra-muscular',
        site: 'Upper arm',
      },
    ],
  },
]

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

const getStageStatus = (ageDays, stage, nextStage) => {
  if (ageDays === null) {
    return 'planned'
  }

  if (ageDays < stage.minAgeDays) {
    return 'upcoming'
  }

  if (!nextStage || ageDays < nextStage.minAgeDays) {
    return 'due'
  }

  return 'completed'
}

const getNextDueStage = (ageDays) => {
  if (ageDays === null) {
    return vaccineMilestones[0]
  }

  return (
    vaccineMilestones.find((stage, index) => {
      const nextStage = vaccineMilestones[index + 1]
      return ageDays < stage.minAgeDays || !nextStage || ageDays < nextStage.minAgeDays
    }) ?? vaccineMilestones[vaccineMilestones.length - 1]
  )
}

const statusLabelMap = {
  completed: 'Completed window',
  due: 'Due now',
  upcoming: 'Upcoming',
  planned: 'Needs DOB',
}

const VaccinationSection = () => {
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'
  const savedProfile = getSavedBabyProfile(loggedInUser?.email)
  const familyType = savedProfile?.familyType === 'twins' ? 'twins' : 'single'
  const babies = savedProfile?.babies ?? []
  const availableBabies = babies.filter((profile) => hasProfileData(profile))

  if (role !== 'parent') {
    return (
      <section className="dashboard-section-panel parent-dashboard-page">
        <div className="dashboard-section-intro">
          <span className="dashboard-section-label">{role} view</span>
          <h2 className="dashboard-section-title">Vaccination Schedule</h2>
          <p className="dashboard-section-copy">
            This section is now tailored for parents and reads the saved baby profile to show
            vaccine milestones.
          </p>
        </div>

        <div className="dashboard-section-card">
          <p className="mb-3">
            Sign in with a parent account to see baby-specific vaccination tracking.
          </p>
          <p className="mb-0">Current account: {loggedInUser?.email || 'No email found'}</p>
        </div>
      </section>
    )
  }

  if (!availableBabies.length) {
    return (
      <section className="dashboard-section-panel parent-dashboard-page">
        <div className="dashboard-section-intro">
          <span className="dashboard-section-label">Vaccination</span>
          <h2 className="dashboard-section-title">Add a baby profile first</h2>
          <p className="dashboard-section-copy mb-0">
            Save your baby profile so the vaccination section can show the right schedule and due
            windows.
          </p>
        </div>

        <div className="dashboard-section-card">
          <p className="mb-3">
            Once your baby name and date of birth are saved, this page will highlight the next
            vaccine visit automatically.
          </p>
          <Link className="btn btn-primary" to="/dashboard">
            Go to Dashboard
          </Link>
        </div>
      </section>
    )
  }

  const babySummaries = availableBabies.map((profile, index) => {
    const ageDays = calculateAgeDays(profile.dob)
    const nextDueStage = getNextDueStage(ageDays)

    return {
      profile,
      index,
      ageDays,
      nextDueStage,
      displayName: profile.name || getBabyLabel(familyType, index),
      label: getBabyLabel(familyType, index),
    }
  })

  const babiesNeedingDob = babySummaries.filter(({ ageDays }) => ageDays === null).length
  const nextDueSummary =
    babySummaries.find(({ ageDays }) => ageDays !== null)?.nextDueStage?.ageLabel ?? 'Birth'

  return (
    <section className="dashboard-section-panel parent-dashboard-page vaccination-page">
      <div className="dashboard-section-intro">
        <span className="dashboard-section-label">Vaccination</span>
        <h2 className="dashboard-section-title">Vaccination schedule for your family</h2>
        <p className="dashboard-section-copy mb-0">
          Review the next immunization milestone for your{' '}
          {familyType === 'twins' ? 'twins' : 'baby'} and keep doctor visits organized.
        </p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <article className="vaccination-summary-card h-100">
            <span className="dashboard-section-card-label">Profile type</span>
            <h3>{familyType === 'twins' ? 'Twins plan' : 'Single baby plan'}</h3>
            <p className="mb-0">
              Tracking {availableBabies.length} saved {availableBabies.length === 1 ? 'baby' : 'babies'}.
            </p>
          </article>
        </div>

        <div className="col-md-4">
          <article className="vaccination-summary-card h-100">
            <span className="dashboard-section-card-label">Next milestone</span>
            <h3>{nextDueSummary}</h3>
            <p className="mb-0">
              Use this page as a quick reminder before your next clinic visit.
            </p>
          </article>
        </div>

        <div className="col-md-4">
          <article className="vaccination-summary-card h-100">
            <span className="dashboard-section-card-label">Attention needed</span>
            <h3>{babiesNeedingDob ? `${babiesNeedingDob} profile missing DOB` : 'All DOBs saved'}</h3>
            <p className="mb-0">
              Dates of birth help this page estimate which vaccines may be due.
            </p>
          </article>
        </div>
      </div>

      <div className="row g-4">
        {babySummaries.map(({ profile, index, ageDays, nextDueStage, displayName, label }) => (
          <div className={familyType === 'twins' ? 'col-xl-6' : 'col-12'} key={label}>
            <article className="vaccination-baby-card h-100">
              <div className="vaccination-baby-header">
                <div>
                  <span className="dashboard-section-card-label">{label}</span>
                  <h3>{displayName}</h3>
                </div>
                <span className="vaccination-status vaccination-status-due">
                  Next: {nextDueStage.ageLabel}
                </span>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <article className="dashboard-profile-mini-card">
                    <span className="dashboard-section-card-label">Date of birth</span>
                    <strong>{profile.dob || 'Not provided'}</strong>
                  </article>
                </div>
                <div className="col-sm-6">
                  <article className="dashboard-profile-mini-card">
                    <span className="dashboard-section-card-label">Age</span>
                    <strong>{formatAge(ageDays)}</strong>
                  </article>
                </div>
              </div>

              <div className="vaccination-timeline">
                {vaccineMilestones.map((stage, stageIndex) => {
                  const nextStage = vaccineMilestones[stageIndex + 1]
                  const status = getStageStatus(ageDays, stage, nextStage)

                  return (
                    <article className="vaccination-stage-card" key={`${label}-${stage.ageLabel}`}>
                      <div className="vaccination-stage-header">
                        <div>
                          <span className="dashboard-section-card-label">{stage.ageLabel}</span>
                          <h4>{stage.note}</h4>
                        </div>
                        <span className={`vaccination-status vaccination-status-${status}`}>
                          {statusLabelMap[status]}
                        </span>
                      </div>
                      <div className="vaccination-stage-list">
                        {stage.vaccines.map((vaccine) => (
                          <article
                            className="vaccination-vaccine-item"
                            key={`${stage.ageLabel}-${vaccine.name}`}
                          >
                            <strong>{vaccine.name}</strong>
                            <p className="mb-2">{vaccine.timing}</p>
                            <div className="vaccination-vaccine-meta">
                              <span>Dose: {vaccine.dose}</span>
                              <span>Route: {vaccine.route}</span>
                              <span>Site: {vaccine.site}</span>
                            </div>
                          </article>
                        ))}
                      </div>
                    </article>
                  )
                })}
              </div>
            </article>
          </div>
        ))}
      </div>

      <div className="vaccination-footnotes mt-4">
        <article className="vaccination-summary-card">
          <span className="dashboard-section-card-label">Schedule notes</span>
          <h3>Important notes</h3>
          <p className="mb-2">
            JE is given only in endemic districts.
          </p>
          <p className="mb-2">
            PCV is currently listed for selected states and districts under UIP rollout.
          </p>
          <p className="mb-2">
            Vitamin A 2nd to 9th doses continue every 6 months up to 5 years of age.
          </p>
          <p className="mb-0">
            UIP guidance replaced TT with Td for the 10-year and 16-year doses. Parents should
            still confirm local availability with their pediatrician or vaccination center.
          </p>
        </article>
      </div>
    </section>
  )
}

export default VaccinationSection
