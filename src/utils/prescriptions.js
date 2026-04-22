const PRESCRIPTION_STORAGE_PREFIX = 'babyPrescriptions:'

const normalizeEmail = (email = '') => email.trim().toLowerCase()

const getStorageKey = (patientEmail = '') => {
  const normalizedEmail = normalizeEmail(patientEmail)

  return normalizedEmail
    ? `${PRESCRIPTION_STORAGE_PREFIX}${normalizedEmail}`
    : `${PRESCRIPTION_STORAGE_PREFIX}${patientEmail.trim()}`
}

export const getPrescriptions = (patientEmail) => {
  if (!patientEmail) return []

  const normalizedKey = getStorageKey(patientEmail)
  const legacyKey = `${PRESCRIPTION_STORAGE_PREFIX}${patientEmail.trim()}`
  const savedData = window.localStorage.getItem(normalizedKey) ?? window.localStorage.getItem(legacyKey)

  try {
    return savedData ? JSON.parse(savedData) : []
  } catch {
    return []
  }
}

export const savePrescription = (patientEmail, prescription) => {
  if (!patientEmail || !prescription) return []

  const storageKey = getStorageKey(patientEmail)
  const currentPrescriptions = getPrescriptions(patientEmail)
  const nextPrescription = {
    ...prescription,
    id: prescription.id ?? `rx-${Date.now()}`,
    prescribedAt: prescription.prescribedAt ?? new Date().toISOString(),
    medication: prescription.medication ?? '',
    dosage: prescription.dosage ?? '',
    frequency: prescription.frequency ?? '',
    duration: prescription.duration ?? '',
    route: prescription.route ?? '',
    instructions: prescription.instructions ?? '',
    warnings: prescription.warnings ?? '',
    followUp: prescription.followUp ?? '',
  }

  const existingIndex = currentPrescriptions.findIndex((rx) => rx.id === nextPrescription.id)
  const nextPrescriptions = [...currentPrescriptions]

  if (existingIndex >= 0) {
    nextPrescriptions[existingIndex] = {
      ...nextPrescriptions[existingIndex],
      ...nextPrescription
    }
  } else {
    nextPrescriptions.unshift(nextPrescription)
  }

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(nextPrescriptions)
  )

  if (normalizeEmail(patientEmail)) {
    window.localStorage.removeItem(`${PRESCRIPTION_STORAGE_PREFIX}${patientEmail.trim()}`)
  }

  return nextPrescriptions
}

export const deletePrescription = (patientEmail, prescriptionId) => {
  if (!patientEmail || !prescriptionId) return []

  const storageKey = getStorageKey(patientEmail)
  const currentPrescriptions = getPrescriptions(patientEmail)
  const nextPrescriptions = currentPrescriptions.filter((rx) => rx.id !== prescriptionId)

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(nextPrescriptions)
  )

  if (normalizeEmail(patientEmail)) {
    window.localStorage.removeItem(`${PRESCRIPTION_STORAGE_PREFIX}${patientEmail.trim()}`)
  }

  return nextPrescriptions
}
