import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../components/style/parentdashboard.css'
import { getLoggedInUser } from '../utils/navigation'
import { getSavedBabyProfile, saveBabyProfile } from '../utils/babyProfile'

const emptyBabyProfile = {
  name: '',
  dob: '',
  gender: '',
  weight: '',
  height: '',
}

const emptyFamilyProfile = {
  familyType: 'single',
  babies: [{ ...emptyBabyProfile }],
}

const normalizeBabyProfile = (profile = {}) => ({
  name: profile.name ?? '',
  dob: profile.dob ?? '',
  gender: profile.gender ?? '',
  weight: profile.weight ?? '',
  height: profile.height ?? '',
})

const normalizeFamilyProfile = (profile = emptyFamilyProfile) => {
  const familyType = profile?.familyType === 'twins' ? 'twins' : 'single'
  const babyCount = familyType === 'twins' ? 2 : 1
  const babies = Array.from({ length: babyCount }, (_, index) =>
    normalizeBabyProfile(profile?.babies?.[index] ?? emptyBabyProfile)
  )

  return {
    familyType,
    babies,
  }
}

const getBabyLabel = (familyType, index) =>
  familyType === 'twins' ? `Twin ${index === 0 ? 'A' : 'B'}` : 'Baby'

const profilesMatch = (leftProfile, rightProfile) =>
  JSON.stringify(normalizeFamilyProfile(leftProfile)) ===
  JSON.stringify(normalizeFamilyProfile(rightProfile))

const hasProfileData = (profile = {}) => Object.values(normalizeBabyProfile(profile)).some(Boolean)

const roleTitles = {
  parent: 'Parent user',
  doctor: 'Doctor user',
  admin: 'Admin user',
}

const ParentDashboard = () => {
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'
  const [savedProfile, setSavedProfile] = useState(() =>
    normalizeFamilyProfile(getSavedBabyProfile(loggedInUser?.email) ?? emptyFamilyProfile)
  )
  const [profileDraft, setProfileDraft] = useState(savedProfile)
  const [isEditing, setIsEditing] = useState(() =>
    !savedProfile.babies.some((profile) => hasProfileData(profile))
  )
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (!toastMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 2800)

    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  const handleFamilyTypeChange = (event) => {
    const nextFamilyType = event.target.value

    setProfileDraft((current) => {
      const currentBabies = current.babies ?? []
      const nextBabies =
        nextFamilyType === 'twins'
          ? [
              normalizeBabyProfile(currentBabies[0] ?? emptyBabyProfile),
              normalizeBabyProfile(currentBabies[1] ?? emptyBabyProfile),
            ]
          : [normalizeBabyProfile(currentBabies[0] ?? emptyBabyProfile)]

      return {
        familyType: nextFamilyType,
        babies: nextBabies,
      }
    })
  }

  const handleChange = (index, event) => {
    const { name, value } = event.target
    setProfileDraft((current) => ({
      ...current,
      babies: current.babies.map((profile, profileIndex) =>
        profileIndex === index ? { ...profile, [name]: value } : profile
      ),
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextSavedProfile = normalizeFamilyProfile(profileDraft)
    saveBabyProfile(nextSavedProfile, loggedInUser?.email)
    setSavedProfile(nextSavedProfile)
    setProfileDraft(nextSavedProfile)
    setIsEditing(false)
    setToastMessage(
      nextSavedProfile.familyType === 'twins'
        ? 'Twin baby profiles saved successfully.'
        : 'Baby profile saved successfully.'
    )
  }

  const hasSavedProfile = savedProfile.babies.some((profile) => hasProfileData(profile))
  const hasChanges = !profilesMatch(profileDraft, savedProfile)
  const saveButtonLabel =
    profileDraft.familyType === 'twins' ? 'Save Twin Profiles' : 'Save Baby Profile'
  const visibleProfiles = isEditing ? profileDraft : savedProfile
  const dashboardTitle =
    visibleProfiles.familyType === 'twins' ? 'Twin baby profile' : 'Baby profile'
  const dashboardHeading =
    visibleProfiles.familyType === 'twins'
      ? 'Manage details for Twin A and Twin B'
      : 'Manage your baby profile'

  return (
    <main className="container parent-dashboard-page">
      <div className="row justify-content-center">
        <div className="col-xl-10">
          <div className="card shadow-sm border-0 h-100 dashboard-profile-card">
            <div className="card-body p-4">
              <span className="text-uppercase small text-muted">{roleTitles[role]}</span>
              <h1 className="h3 mt-2 mb-3">Parent dashboard</h1>
              <p className="text-muted mb-4">
                Add your baby details once, then review them here whenever you need them.
              </p>

              <div className="dashboard-section-card mb-4">
                <span className="dashboard-section-card-label">Logged-in account</span>
                <h3 className="h5">{loggedInUser?.email}</h3>
                <p className="mb-0">
                  Your email matched the <strong>{role}</strong> role.
                </p>
              </div>

              {role === 'parent' && (
                <>
                  {isEditing ? (
                    <form onSubmit={handleSubmit}>
                      <div className="dashboard-form-intro mb-4">
                        <span className="dashboard-section-card-label">{dashboardTitle}</span>
                        <h2 className="h4 mt-2 mb-2">{dashboardHeading}</h2>
                        <p className="mb-0 text-muted">
                          Choose whether this is a single baby or twins, then save the profile to
                          keep the form hidden afterward.
                        </p>
                      </div>

                      <div className="dashboard-family-toggle mb-4">
                        <label className="form-label" htmlFor="familyType">
                          Profile type
                        </label>
                        <select
                          className="form-select"
                          id="familyType"
                          name="familyType"
                          value={profileDraft.familyType}
                          onChange={handleFamilyTypeChange}
                        >
                          <option value="single">Single baby</option>
                          <option value="twins">Twins</option>
                        </select>
                      </div>

                      <div className="row g-4">
                        {profileDraft.babies.map((profile, index) => (
                          <div
                            className={profileDraft.familyType === 'twins' ? 'col-lg-6' : 'col-12'}
                            key={getBabyLabel(profileDraft.familyType, index)}
                          >
                            <section className="dashboard-twin-editor-card h-100">
                              <div className="dashboard-twin-editor-header">
                                <span className="dashboard-section-card-label">Baby profile</span>
                                <h3 className="h5 mb-1">
                                  {getBabyLabel(profileDraft.familyType, index)}
                                </h3>
                                <p className="mb-0 text-muted">
                                  Save health details for appointments, growth tracking, and daily
                                  care.
                                </p>
                              </div>

                              <div className="row g-3">
                                <div className="col-12">
                                  <label className="form-label" htmlFor={`name-${index}`}>
                                    Baby name
                                  </label>
                                  <input
                                    className="form-control"
                                    id={`name-${index}`}
                                    name="name"
                                    type="text"
                                    value={profile.name}
                                    onChange={(event) => handleChange(index, event)}
                                    placeholder={`Enter ${getBabyLabel(profileDraft.familyType, index).toLowerCase()} name`}
                                  />
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label" htmlFor={`dob-${index}`}>
                                    Date of birth
                                  </label>
                                  <input
                                    className="form-control"
                                    id={`dob-${index}`}
                                    name="dob"
                                    type="date"
                                    value={profile.dob}
                                    onChange={(event) => handleChange(index, event)}
                                  />
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label" htmlFor={`gender-${index}`}>
                                    Gender
                                  </label>
                                  <select
                                    className="form-select"
                                    id={`gender-${index}`}
                                    name="gender"
                                    value={profile.gender}
                                    onChange={(event) => handleChange(index, event)}
                                  >
                                    <option value="">Select</option>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                  </select>
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label" htmlFor={`weight-${index}`}>
                                    Weight
                                  </label>
                                  <input
                                    className="form-control"
                                    id={`weight-${index}`}
                                    name="weight"
                                    type="text"
                                    value={profile.weight}
                                    onChange={(event) => handleChange(index, event)}
                                    placeholder="e.g. 6.2 kg"
                                  />
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label" htmlFor={`height-${index}`}>
                                    Height
                                  </label>
                                  <input
                                    className="form-control"
                                    id={`height-${index}`}
                                    name="height"
                                    type="text"
                                    value={profile.height}
                                    onChange={(event) => handleChange(index, event)}
                                    placeholder="e.g. 62 cm"
                                  />
                                </div>
                              </div>
                            </section>
                          </div>
                        ))}

                        <div className="col-12">
                          <div className="d-flex flex-wrap gap-3">
                            <button
                              className="btn btn-primary"
                              type="submit"
                              disabled={hasSavedProfile && !hasChanges}
                            >
                              {saveButtonLabel}
                            </button>
                            {hasSavedProfile && (
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => {
                                  setProfileDraft(savedProfile)
                                  setIsEditing(false)
                                }}
                              >
                                Cancel
                              </button>
                            )}
                            <Link className="btn btn-outline-primary" to="/dashboard/profile">
                              View Saved Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="dashboard-profile-empty-state mb-4">
                      Your {savedProfile.familyType === 'twins' ? 'twin profiles are' : 'baby profile is'} saved.
                      Use Edit Profile if you want to make changes.
                    </div>
                  )}
                </>
              )}

              {role === 'parent' && (
                <section className="dashboard-saved-profile mt-4">
                  <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-3">
                    <div>
                      <span className="dashboard-section-card-label">Current saved profile</span>
                      <h2 className="h5 mt-2 mb-1">
                        {savedProfile.familyType === 'twins'
                          ? 'Twin details on this dashboard'
                          : 'Baby details on this dashboard'}
                      </h2>
                      <p className="mb-0">
                        Review the latest saved information without leaving this page.
                      </p>
                    </div>
                    {!isEditing && hasSavedProfile && (
                      <span className="dashboard-save-badge">Up to date</span>
                    )}
                  </div>

                  {hasSavedProfile ? (
                    <div className="row g-3">
                      {savedProfile.babies.map((profile, index) => (
                        <div
                          className={savedProfile.familyType === 'twins' ? 'col-lg-6' : 'col-12'}
                          key={getBabyLabel(savedProfile.familyType, index)}
                        >
                          <article className="dashboard-twin-summary-card">
                            <div className="d-flex justify-content-between gap-3 align-items-start">
                              <div>
                                <span className="dashboard-section-card-label">Saved baby</span>
                                <h3 className="h5 mt-2 mb-0">
                                  {getBabyLabel(savedProfile.familyType, index)}
                                </h3>
                              </div>
                              {hasProfileData(profile) && (
                                <span className="dashboard-save-badge">Saved</span>
                              )}
                            </div>

                            {hasProfileData(profile) ? (
                              <div className="row g-3 mt-1">
                                <div className="col-sm-6">
                                  <article className="dashboard-profile-mini-card">
                                    <span className="dashboard-section-card-label">Name</span>
                                    <strong>{profile.name || 'Not provided'}</strong>
                                  </article>
                                </div>
                                <div className="col-sm-6">
                                  <article className="dashboard-profile-mini-card">
                                    <span className="dashboard-section-card-label">
                                      Date of birth
                                    </span>
                                    <strong>{profile.dob || 'Not provided'}</strong>
                                  </article>
                                </div>
                                <div className="col-sm-6">
                                  <article className="dashboard-profile-mini-card">
                                    <span className="dashboard-section-card-label">Gender</span>
                                    <strong>{profile.gender || 'Not provided'}</strong>
                                  </article>
                                </div>
                                <div className="col-sm-6">
                                  <article className="dashboard-profile-mini-card">
                                    <span className="dashboard-section-card-label">Weight</span>
                                    <strong>{profile.weight || 'Not provided'}</strong>
                                  </article>
                                </div>
                                <div className="col-12">
                                  <article className="dashboard-profile-mini-card">
                                    <span className="dashboard-section-card-label">Height</span>
                                    <strong>{profile.height || 'Not provided'}</strong>
                                  </article>
                                </div>
                              </div>
                            ) : (
                              <div className="dashboard-profile-empty-state mt-3">
                                No details saved for{' '}
                                {getBabyLabel(savedProfile.familyType, index).toLowerCase()} yet.
                              </div>
                            )}
                          </article>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dashboard-profile-empty-state">
                      Save the form once and the baby profile will appear here.
                    </div>
                  )}

                  {hasSavedProfile && !isEditing && (
                    <div className="d-flex flex-wrap gap-3 mt-4">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </button>
                      <Link className="btn btn-outline-primary" to="/dashboard/profile">
                        View Saved Profile
                      </Link>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="dashboard-toast" role="status" aria-live="polite">
          <strong>Saved</strong>
          <p className="mb-0">{toastMessage}</p>
        </div>
      )}
    </main>
  )
}

export default ParentDashboard
