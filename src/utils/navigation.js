import { getDoctorByEmail, validateDoctorCredentials } from './doctors'
import { validateUser } from './users'

const AUTH_STORAGE_KEY = 'babyBloomAuth'

export const navigateTo = (path) => {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}

const readLoggedInUser = () => {
  const savedUser = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!savedUser) {
    return null
  }

  try {
    return JSON.parse(savedUser)
  } catch {
    return null
  }
}

export const getRoleFromEmail = (email = '') => {
  const lowerCaseEmail = email.trim().toLowerCase()

  if (lowerCaseEmail === 'admin@@gmail.com' || lowerCaseEmail.startsWith('admin')) {
    return 'admin'
  }

  if (getDoctorByEmail(lowerCaseEmail)) {
    return 'doctor'
  }

  return 'parent'
}

export const authenticateUser = (email = '', password = '') => {
  const normalizedEmail = email.trim().toLowerCase()
  const role = getRoleFromEmail(normalizedEmail)

  if (!normalizedEmail) {
    return {
      success: false,
      message: 'Enter an email address to continue.',
    }
  }

  let isValid = false

  if (role === 'admin') {
    isValid = password === 'admin123'
  } else if (role === 'doctor') {
    const doctor = validateDoctorCredentials(normalizedEmail, password)
    isValid = doctor !== null && doctor !== false
  } else if (role === 'parent') {
    const parent = validateUser(normalizedEmail, password)
    isValid = parent !== null && parent !== false
  }

  if (!isValid) {
    return {
      success: false,
      message: 'Wrong email or password.',
    }
  }

  return {
    success: true,
    user: saveLoggedInUser(normalizedEmail),
  }
}

export const saveLoggedInUser = (email) => {
  const user = {
    email: email.trim().toLowerCase(),
    role: getRoleFromEmail(email),
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))

  return user
}

export const getLoggedInUser = () => readLoggedInUser()

export const logoutLoggedInUser = () => {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}
