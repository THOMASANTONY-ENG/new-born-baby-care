const BABY_PROFILE_STORAGE_KEY = 'babyProfile'
const BABY_PROFILE_STORAGE_PREFIX = `${BABY_PROFILE_STORAGE_KEY}:`
const EMPTY_BABY_PROFILE = {
  name: '',
  dob: '',
  gender: '',
  weight: '',
  height: '',
}

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

const normalizeBabyProfile = (profile = {}) => ({
  name: profile.name ?? '',
  dob: profile.dob ?? '',
  gender: profile.gender ?? '',
  weight: profile.weight ?? '',
  height: profile.height ?? '',
})

const createEmptyBabies = (count) =>
  Array.from({ length: count }, () => normalizeBabyProfile(EMPTY_BABY_PROFILE))

const hasLegacyBabyProfileShape = (profile) =>
  Boolean(profile) &&
  !Array.isArray(profile) &&
  ['name', 'dob', 'gender', 'weight', 'height'].some((field) => field in profile)

const normalizeFamilyBabyProfile = (profile) => {
  if (Array.isArray(profile)) {
    return {
      familyType: 'twins',
      babies: [0, 1].map((index) => normalizeBabyProfile(profile[index] ?? EMPTY_BABY_PROFILE)),
    }
  }

  if (Array.isArray(profile?.babies)) {
    const familyType = profile.familyType === 'single' ? 'single' : 'twins'
    const babyCount = familyType === 'single' ? 1 : 2

    return {
      familyType,
      babies: Array.from({ length: babyCount }, (_, index) =>
        normalizeBabyProfile(profile.babies[index] ?? EMPTY_BABY_PROFILE)
      ),
    }
  }

  if (hasLegacyBabyProfileShape(profile)) {
    return {
      familyType: 'single',
      babies: [normalizeBabyProfile(profile)],
    }
  }

  return null
}

export const getSavedBabyProfile = (email = '') => {
  const normalizedEmail = normalizeEmail(email)
  let savedProfile = null

  if (normalizedEmail) {
    const scopedProfile = readStoredProfile(getStorageKey(normalizedEmail))

    if (scopedProfile) {
      savedProfile = scopedProfile
    }
  }

  if (!savedProfile) {
    savedProfile = readStoredProfile(BABY_PROFILE_STORAGE_KEY)
  }

  return normalizeFamilyBabyProfile(savedProfile)
}

export const saveBabyProfile = (profile, email = '') => {
  const storageKey = getStorageKey(email)
  const normalizedProfile =
    normalizeFamilyBabyProfile(profile) ?? {
      familyType: 'single',
      babies: createEmptyBabies(1),
    }

  window.localStorage.setItem(storageKey, JSON.stringify(normalizedProfile))

  if (normalizeEmail(email)) {
    window.localStorage.removeItem(BABY_PROFILE_STORAGE_KEY)
  }

  return normalizedProfile
}
