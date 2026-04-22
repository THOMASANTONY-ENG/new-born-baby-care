const STORAGE_KEYS = {
  profilePrefix: 'babyProfile:',
  appointmentsPrefix: 'babyAppointments:',
  growthPrefix: 'babyGrowthLogs:',
  notesPrefix: 'babyCareNotes:',
}

const emptyBabyProfile = {
  name: '',
  dob: '',
  gender: '',
  weight: '',
  height: '',
}

const normalizeBabyProfile = (profile = {}) => ({
  name: profile.name ?? '',
  dob: profile.dob ?? '',
  gender: profile.gender ?? '',
  weight: profile.weight ?? '',
  height: profile.height ?? '',
})

const normalizeFamilyProfile = (profile) => {
  if (Array.isArray(profile?.babies)) {
    const familyType = profile.familyType === 'single' ? 'single' : 'twins'
    const babyCount = familyType === 'single' ? 1 : 2

    return {
      familyType,
      babies: Array.from({ length: babyCount }, (_, index) =>
        normalizeBabyProfile(profile.babies[index] ?? emptyBabyProfile)
      ),
    }
  }

  if (profile && ['name', 'dob', 'gender', 'weight', 'height'].some((field) => field in profile)) {
    return {
      familyType: 'single',
      babies: [normalizeBabyProfile(profile)],
    }
  }

  return null
}

const hasProfileData = (profile = {}) => Object.values(normalizeBabyProfile(profile)).some(Boolean)

const countFilledFields = (profile = {}) =>
  ['name', 'dob', 'gender', 'weight', 'height'].reduce(
    (total, field) => total + (normalizeBabyProfile(profile)[field] ? 1 : 0),
    0
  )

const parseStoredJson = (value, fallback) => {
  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

const parseDate = (value) => {
  if (!value) {
    return null
  }

  const parsedDate = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

const parseAppointmentDateTime = (dateValue, timeValue = '') => {
  const parsedDate = parseDate(dateValue)

  if (!parsedDate) {
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

const formatLongDate = (value, fallback = 'No date') => {
  const parsedDate = value instanceof Date ? value : parseDate(value)

  if (!parsedDate) {
    return fallback
  }

  return parsedDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getStorageEntriesByPrefix = (prefix) => {
  const entries = []

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)

    if (!key || !key.startsWith(prefix)) {
      continue
    }

    entries.push({
      key,
      value: window.localStorage.getItem(key),
    })
  }

  return entries
}

export const getAdminDashboardData = () => {
  const profileEntries = getStorageEntriesByPrefix(STORAGE_KEYS.profilePrefix).map(({ key, value }) => {
    const email = key.replace(STORAGE_KEYS.profilePrefix, '')
    const normalizedProfile = normalizeFamilyProfile(parseStoredJson(value, null))
    const babies = normalizedProfile?.babies ?? []
    const activeBabies = babies.filter((profile) => hasProfileData(profile))
    const totalFields = babies.length * 5
    const completedFields = babies.reduce((total, profile) => total + countFilledFields(profile), 0)

    return {
      email,
      familyType: normalizedProfile?.familyType ?? 'single',
      babies,
      activeBabies,
      totalFields,
      completedFields,
      completionRate: totalFields ? Math.round((completedFields / totalFields) * 100) : 0,
      missingDobCount: activeBabies.filter((profile) => !profile.dob).length,
    }
  })

  const appointmentEntries = getStorageEntriesByPrefix(STORAGE_KEYS.appointmentsPrefix).flatMap(
    ({ key, value }) => {
      const email = key.replace(STORAGE_KEYS.appointmentsPrefix, '')
      const appointments = parseStoredJson(value, [])

      return Array.isArray(appointments)
        ? appointments.map((appointment) => ({
            email,
            ...appointment,
          }))
        : []
    }
  )

  const growthEntries = getStorageEntriesByPrefix(STORAGE_KEYS.growthPrefix).flatMap(({ key, value }) => {
    const email = key.replace(STORAGE_KEYS.growthPrefix, '')
    const logs = parseStoredJson(value, [])

    return Array.isArray(logs)
      ? logs.map((log) => ({
          email,
          ...log,
        }))
      : []
  })

  const noteEntries = getStorageEntriesByPrefix(STORAGE_KEYS.notesPrefix).flatMap(({ key, value }) => {
    const email = key.replace(STORAGE_KEYS.notesPrefix, '')
    const notes = parseStoredJson(value, [])

    return Array.isArray(notes)
      ? notes.map((note) => ({
          email,
          ...note,
        }))
      : []
  })

  const today = new Date()
  const upcomingAppointments = appointmentEntries.filter((appointment) => {
    const appointmentDate = parseAppointmentDateTime(
      appointment.appointmentDate,
      appointment.appointmentTime
    )

    return appointmentDate && appointmentDate >= today
  })

  const recentActivity = [
    ...appointmentEntries.map((appointment) => ({
      id: `appointment-${appointment.id}`,
      type: 'Appointment',
      title: appointment.babyName || appointment.babyLabel || 'Baby',
      subtitle: appointment.clinicName || 'Clinic not added',
      email: appointment.email,
      dateValue: parseAppointmentDateTime(appointment.appointmentDate, appointment.appointmentTime),
      dateLabel: appointment.appointmentDate
        ? `${formatLongDate(appointment.appointmentDate)}${
            appointment.appointmentTime ? ` at ${appointment.appointmentTime}` : ''
          }`
        : 'No date saved',
    })),
    ...growthEntries.map((log) => ({
      id: `growth-${log.id}`,
      type: 'Growth',
      title: log.babyName || log.babyLabel || 'Baby',
      subtitle: [log.weight, log.height].filter(Boolean).join(' / ') || 'Measurement saved',
      email: log.email,
      dateValue: parseDate(log.recordDate),
      dateLabel: formatLongDate(log.recordDate, 'No record date'),
    })),
    ...noteEntries.map((note) => ({
      id: `note-${note.id}`,
      type: 'Note',
      title: note.title || 'Care note',
      subtitle: note.category || 'Daily care',
      email: note.email,
      dateValue: note.updatedAt ? new Date(note.updatedAt) : parseDate(note.noteDate),
      dateLabel: note.noteDate ? formatLongDate(note.noteDate) : 'Recently updated',
    })),
  ]
    .filter((item) => item.dateValue)
    .sort((left, right) => right.dateValue - left.dateValue)
    .slice(0, 6)

  const adminAlerts = [
    ...profileEntries
      .filter((entry) => !entry.activeBabies.length)
      .map((entry) => ({
        email: entry.email,
        message: 'Profile exists but no baby details are filled in yet.',
      })),
    ...profileEntries
      .filter((entry) => entry.missingDobCount > 0)
      .map((entry) => ({
        email: entry.email,
        message: `${entry.missingDobCount} saved baby profile needs a date of birth.`,
      })),
    ...profileEntries
      .filter(
        (entry) =>
          entry.activeBabies.length > 0 && entry.completionRate > 0 && entry.completionRate < 100
      )
      .map((entry) => ({
        email: entry.email,
        message: `Profile is only ${entry.completionRate}% complete.`,
      })),
  ].slice(0, 6)

  return {
    totalFamilies: profileEntries.length,
    totalActiveBabies: profileEntries.reduce((total, entry) => total + entry.activeBabies.length, 0),
    totalAppointments: appointmentEntries.length,
    upcomingAppointments: upcomingAppointments.length,
    totalGrowthLogs: growthEntries.length,
    totalNotes: noteEntries.length,
    completionAverage: profileEntries.length
      ? Math.round(
          profileEntries.reduce((total, entry) => total + entry.completionRate, 0) / profileEntries.length
        )
      : 0,
    recentActivity,
    adminAlerts,
    familySnapshots: profileEntries
      .sort((left, right) => left.email.localeCompare(right.email)),
  }
}

export const deleteUser = (email) => {
  const keysToRemove = []
  
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (key && (
      key === `${STORAGE_KEYS.profilePrefix}${email}` ||
      key === `${STORAGE_KEYS.appointmentsPrefix}${email}` ||
      key === `${STORAGE_KEYS.growthPrefix}${email}` ||
      key === `${STORAGE_KEYS.notesPrefix}${email}`
    )) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach((key) => window.localStorage.removeItem(key))
}

