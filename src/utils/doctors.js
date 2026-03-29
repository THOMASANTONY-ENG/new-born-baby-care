import { defaultDoctorImage, doctors as defaultDoctors } from '../data/doctors'

const DOCTORS_STORAGE_KEY = 'babyBloomDoctors'
const REMOVED_SEED_DOCTORS_STORAGE_KEY = 'babyBloomRemovedSeedDoctors'

const defaultSlots = {
  monday: ['09:00 AM', '11:00 AM', '02:00 PM'],
  wednesday: ['10:00 AM', '12:30 PM', '03:00 PM'],
  friday: ['09:30 AM', '01:00 PM', '04:00 PM'],
}

const toEmailSlug = (name = '') =>
  name
    .toLowerCase()
    .replace(/dr\.\s*/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')

const getDoctorEmail = (doctor = {}) => {
  const explicitEmail = doctor.email?.trim().toLowerCase()

  if (explicitEmail) {
    return explicitEmail
  }

  const slug = toEmailSlug(doctor.name)
  return slug ? `${slug}@babybloom.com` : ''
}

const getDoctorId = (doctor = {}) =>
  doctor.id ?? doctor.email?.trim().toLowerCase() ?? doctor.name?.trim() ?? `doctor-${Date.now()}`

const normalizeDoctor = (doctor = {}, fallbackImage = defaultDoctorImage) => ({
  id: getDoctorId(doctor),
  name: doctor.name?.trim() ?? 'Doctor name not added',
  email: getDoctorEmail(doctor),
  password: doctor.password ?? '',
  specialty: doctor.specialty?.trim() ?? 'Pediatrician',
  image: doctor.image?.trim() || fallbackImage,
  rating: Number(doctor.rating ?? 4.5),
  slots: doctor.slots && Object.keys(doctor.slots).length ? doctor.slots : defaultSlots,
  source: doctor.source ?? 'custom',
})

const readStoredDoctors = () => {
  const savedDoctors = window.localStorage.getItem(DOCTORS_STORAGE_KEY)

  if (!savedDoctors) {
    return []
  }

  try {
    const parsedDoctors = JSON.parse(savedDoctors)
    return Array.isArray(parsedDoctors) ? parsedDoctors : []
  } catch {
    return []
  }
}

const readRemovedSeedDoctors = () => {
  const saved = window.localStorage.getItem(REMOVED_SEED_DOCTORS_STORAGE_KEY)

  if (!saved) {
    return []
  }

  try {
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const getSavedDoctors = () =>
  readStoredDoctors().map((doctor) => normalizeDoctor(doctor, defaultDoctorImage))

export const getAvailableDoctors = () => {
  const savedDoctors = getSavedDoctors()
  const hiddenSeedIds = new Set(readRemovedSeedDoctors())
  const savedIds = new Set(savedDoctors.map((doctor) => doctor.id))
  const defaultDirectory = defaultDoctors
    .map((doctor) => normalizeDoctor({ ...doctor, source: 'seed' }, doctor.image))
    .filter((doctor) => !hiddenSeedIds.has(doctor.id) && !savedIds.has(doctor.id))

  return [...defaultDirectory, ...savedDoctors]
}

export const getDoctorByEmail = (email = '') => {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) {
    return null
  }

  return getSavedDoctors().find((doctor) => doctor.email === normalizedEmail) ?? null
}

export const doctorEmailExists = (email = '', excludeId = '') => {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) {
    return false
  }

  return getAvailableDoctors().some(
    (doctor) => doctor.email === normalizedEmail && doctor.id !== excludeId
  )
}

export const saveDoctor = (doctor) => {
  const normalizedDoctor = normalizeDoctor(
    {
      ...doctor,
      id: doctor.id ?? doctor.email?.trim().toLowerCase() ?? `custom-doctor-${Date.now()}`,
      source: 'custom',
    },
    defaultDoctorImage
  )
  const savedDoctors = getSavedDoctors()
  const existingDoctorIndex = savedDoctors.findIndex(
    (savedDoctor) =>
      savedDoctor.id === normalizedDoctor.id || savedDoctor.email === normalizedDoctor.email
  )
  const nextDoctors = [...savedDoctors]

  if (existingDoctorIndex >= 0) {
    nextDoctors[existingDoctorIndex] = {
      ...nextDoctors[existingDoctorIndex],
      ...normalizedDoctor,
    }
  } else {
    nextDoctors.unshift(normalizedDoctor)
  }

  window.localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(nextDoctors))

  return nextDoctors
}

export const validateDoctorCredentials = (email = '', password = '') => {
  const doctor = getDoctorByEmail(email)

  if (!doctor) {
    return null
  }

  return doctor.password === password ? doctor : false
}

export const deleteDoctor = (doctorId) => {
  const nextDoctors = getSavedDoctors().filter((doctor) => doctor.id !== doctorId)
  window.localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(nextDoctors))

  const seedDoctorIds = new Set(
    defaultDoctors.map((doctor) => getDoctorId(normalizeDoctor({ ...doctor, source: 'seed' }, doctor.image)))
  )

  if (seedDoctorIds.has(doctorId)) {
    const removedSeedDoctors = readRemovedSeedDoctors()
    if (!removedSeedDoctors.includes(doctorId)) {
      removedSeedDoctors.push(doctorId)
      window.localStorage.setItem(
        REMOVED_SEED_DOCTORS_STORAGE_KEY,
        JSON.stringify(removedSeedDoctors)
      )
    }
  }

  return nextDoctors
}
