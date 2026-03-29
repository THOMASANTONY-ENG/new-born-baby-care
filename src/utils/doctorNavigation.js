const ACTIVE_PATIENT_EMAIL_KEY = 'doctorActivePatientEmail'
const ACTIVE_PATIENT_PAYLOAD_KEY = 'doctorActivePatientPayload'

export const getActivePatientEmail = () => window.localStorage.getItem(ACTIVE_PATIENT_EMAIL_KEY)

export const getActivePatientPayload = () => {
  const payloadStr = window.localStorage.getItem(ACTIVE_PATIENT_PAYLOAD_KEY)
  try {
    return payloadStr ? JSON.parse(payloadStr) : null
  } catch {
    return null
  }
}

export const setActivePatientEmail = (email, additionalPayload = {}) => {
  if (email) {
    window.localStorage.setItem(ACTIVE_PATIENT_EMAIL_KEY, email)
    window.localStorage.setItem(ACTIVE_PATIENT_PAYLOAD_KEY, JSON.stringify(additionalPayload))
  } else {
    window.localStorage.removeItem(ACTIVE_PATIENT_EMAIL_KEY)
    window.localStorage.removeItem(ACTIVE_PATIENT_PAYLOAD_KEY)
  }
}

export const getEffectiveUserEmail = (loggedInUser) => {
  if (loggedInUser?.role === 'doctor') {
    return getActivePatientEmail() || ''
  }
  return loggedInUser?.email || ''
}
