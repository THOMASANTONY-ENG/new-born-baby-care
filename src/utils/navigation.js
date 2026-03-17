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

  if (lowerCaseEmail.startsWith('admin')) {
    return 'admin'
  }

  if (lowerCaseEmail.startsWith('doctor') || lowerCaseEmail.startsWith('dr')) {
    return 'doctor'
  }

  return 'parent'
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
