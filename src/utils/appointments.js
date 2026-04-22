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
  doctorEmail: appointment.doctorEmail ?? '',
  status: appointment.status ?? 'Scheduled', // 'Scheduled', 'In-Progress', 'Completed', 'No-show'
  notes: appointment.notes ?? '',
})

const parseAppointmentDateTime = (dateValue, timeValue = '') => {
  if (!dateValue) {
    return null
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  if (!timeValue) {
    return parsedDate
  }

  const timeMatch = timeValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)

  if (!timeMatch) {
    return parsedDate
  }

  const [, hourValue, minuteValue, meridiem] = timeMatch
  let nextHour = Number(hourValue) % 12

  if (meridiem.toUpperCase() === 'PM') {
    nextHour += 12
  }

  const nextDate = new Date(parsedDate)
  nextDate.setHours(nextHour, Number(minuteValue), 0, 0)

  return nextDate
}

const compareAppointments = (leftAppointment, rightAppointment) => {
  const leftDateTime = parseAppointmentDateTime(
    leftAppointment.appointmentDate,
    leftAppointment.appointmentTime
  )
  const rightDateTime = parseAppointmentDateTime(
    rightAppointment.appointmentDate,
    rightAppointment.appointmentTime
  )

  if (!leftDateTime && !rightDateTime) {
    return leftAppointment.id.localeCompare(rightAppointment.id)
  }

  if (!leftDateTime) {
    return 1
  }

  if (!rightDateTime) {
    return -1
  }

  if (leftDateTime.getTime() !== rightDateTime.getTime()) {
    return leftDateTime.getTime() - rightDateTime.getTime()
  }

  return leftAppointment.id.localeCompare(rightAppointment.id)
}

export const getSavedAppointments = (email = '') =>
  readStoredAppointments(getStorageKey(email))
    .map((appointment) => normalizeAppointment(appointment))
    .sort(compareAppointments)

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

export const updateAppointmentStatus = (appointmentId, newStatus, email = '') => {
  const storageKey = getStorageKey(email)
  const savedAppointments = getSavedAppointments(email)
  const nextAppointments = savedAppointments.map((appointment) => 
    appointment.id === appointmentId ? { ...appointment, status: newStatus } : appointment
  )

  window.localStorage.setItem(storageKey, JSON.stringify(nextAppointments))

  return nextAppointments
}

export const deleteAppointment = (appointmentId, email = '') => {
  const storageKey = getStorageKey(email)
  const savedAppointments = getSavedAppointments(email)
  const nextAppointments = savedAppointments.filter((appointment) => appointment.id !== appointmentId)

  window.localStorage.setItem(storageKey, JSON.stringify(nextAppointments))

  return nextAppointments
}

export const getAllAppointments = () => {
  const allAppointments = []

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i) || ""

    if (key.startsWith(APPOINTMENTS_STORAGE_PREFIX)) {
      const email = key.replace(APPOINTMENTS_STORAGE_PREFIX, '')
      const appointments = readStoredAppointments(key).map((appointment) => ({
        ...normalizeAppointment(appointment),
        parentEmail: email,
      }))
      allAppointments.push(...appointments)
    }
  }

  return allAppointments.sort(compareAppointments)
}
