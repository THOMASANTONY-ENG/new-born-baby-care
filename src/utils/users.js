const PARENTS_STORAGE_KEY = 'babyBloomParents'

const getParents = () => {
  const saved = window.localStorage.getItem(PARENTS_STORAGE_KEY)
  if (!saved) return []
  try {
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const saveUser = (email, password) => {
  const parents = getParents()
  const normalizedEmail = email.trim().toLowerCase()
  const existingIndex = parents.findIndex((p) => p.email === normalizedEmail)

  if (existingIndex >= 0) {
    parents[existingIndex].password = password
  } else {
    parents.push({ email: normalizedEmail, password })
  }

  window.localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(parents))
}

export const validateUser = (email, password) => {
  const parents = getParents()
  const normalizedEmail = email.trim().toLowerCase()
  const user = parents.find((p) => p.email === normalizedEmail)
  
  if (!user) return null
  return user.password === password ? user : false
}

export const userEmailExists = (email) => {
  const parents = getParents()
  const normalizedEmail = email.trim().toLowerCase()
  return parents.some((p) => p.email === normalizedEmail)
}
