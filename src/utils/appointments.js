const APPOINTMENTS_STORAGE_KEY = 'babyAppointments'
const APPOINTMENTS_STORAGE_PREFIX = `${APPOINTMENTS_STORAGE_KEY}:`

const normalizeEmail = (email = '') => email.trim().toLowerCase()

const getStorageKey = (email = '') => {
  const normalizedEmail = normalizeEmail(email)

  return normalizedEmail
    ? `${APPOINTMENTS_STORAGE_PREFIX}${normalizedEmail}`
    : APPOINTMENTS_STORAGE_KEY
}

const readStoredAppointments = (storageKey) => {
  const savedAppointments = window.localStorage.getItem(storageKey)

  if (!savedAppointments) {
    return []
  }

  try {
    const parsedAppointments = JSON.parse(savedAppointments)
    return Array.isArray(parsedAppointments) ? parsedAppointments : []
  } catch {
    return []
  }
}

const normalizeAppointment = (appointment = {}) => ({
  id: appointment.id ?? `${Date.now()}`,
  babyLabel: appointment.babyLabel ?? '',
  babyName: appointment.babyName ?? '',
  visitType: appointment.visitType ?? '',
  appointmentDate: appointment.appointmentDate ?? '',
  appointmentTime: appointment.appointmentTime ?? '',
  clinicName: appointment.clinicName ?? '',
  notes: appointment.notes ?? '',
})

export const getSavedAppointments = (email = '') =>
  readStoredAppointments(getStorageKey(email))
    .map((appointment) => normalizeAppointment(appointment))
    .sort((left, right) =>
      `${left.appointmentDate} ${left.appointmentTime}`.localeCompare(
        `${right.appointmentDate} ${right.appointmentTime}`
      )
    )

export const saveAppointment = (appointment, email = '') => {
  const storageKey = getStorageKey(email)
  const savedAppointments = getSavedAppointments(email)
  const nextAppointments = [...savedAppointments, normalizeAppointment(appointment)]

  window.localStorage.setItem(storageKey, JSON.stringify(nextAppointments))

  if (normalizeEmail(email)) {
    window.localStorage.removeItem(APPOINTMENTS_STORAGE_KEY)
  }

  return nextAppointments
}
