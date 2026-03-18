const BABY_PROFILE_STORAGE_KEY = 'babyProfile'
const BABY_PROFILE_STORAGE_PREFIX = `${BABY_PROFILE_STORAGE_KEY}:`

const normalizeEmail = (email = '') => email.trim().toLowerCase()

const readStoredProfile = (storageKey) => {
  const savedProfile = window.localStorage.getItem(storageKey)

  if (!savedProfile) {
    return null
  }

  try {
    return JSON.parse(savedProfile)
  } catch {
    return null
  }
}

const getStorageKey = (email = '') => {
  const normalizedEmail = normalizeEmail(email)

  return normalizedEmail
    ? `${BABY_PROFILE_STORAGE_PREFIX}${normalizedEmail}`
    : BABY_PROFILE_STORAGE_KEY
}

export const getSavedBabyProfile = (email = '') => {
  const normalizedEmail = normalizeEmail(email)

  if (normalizedEmail) {
    const scopedProfile = readStoredProfile(getStorageKey(normalizedEmail))

    if (scopedProfile) {
      return scopedProfile
    }
  }

  return readStoredProfile(BABY_PROFILE_STORAGE_KEY)
}

export const saveBabyProfile = (profile, email = '') => {
  const storageKey = getStorageKey(email)

  window.localStorage.setItem(storageKey, JSON.stringify(profile))

  if (normalizeEmail(email)) {
    window.localStorage.removeItem(BABY_PROFILE_STORAGE_KEY)
  }

  return profile
}
