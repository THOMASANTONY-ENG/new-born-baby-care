const GROWTH_LOGS_STORAGE_KEY = 'babyGrowthLogs'
const GROWTH_LOGS_STORAGE_PREFIX = `${GROWTH_LOGS_STORAGE_KEY}:`

const normalizeEmail = (email = '') => email.trim().toLowerCase()

const getStorageKey = (email = '') => {
  const normalizedEmail = normalizeEmail(email)

  return normalizedEmail
    ? `${GROWTH_LOGS_STORAGE_PREFIX}${normalizedEmail}`
    : GROWTH_LOGS_STORAGE_KEY
}

const readStoredGrowthLogs = (storageKey) => {
  const savedLogs = window.localStorage.getItem(storageKey)

  if (!savedLogs) {
    return []
  }

  try {
    const parsedLogs = JSON.parse(savedLogs)
    return Array.isArray(parsedLogs) ? parsedLogs : []
  } catch {
    return []
  }
}

const normalizeGrowthLog = (log = {}) => ({
  id: log.id ?? `${Date.now()}`,
  babyLabel: log.babyLabel ?? '',
  babyName: log.babyName ?? '',
  recordDate: log.recordDate ?? '',
  weight: log.weight ?? '',
  height: log.height ?? '',
  note: log.note ?? '',
})

export const getSavedGrowthLogs = (email = '') =>
  readStoredGrowthLogs(getStorageKey(email))
    .map((log) => normalizeGrowthLog(log))
    .sort((left, right) => right.recordDate.localeCompare(left.recordDate))

export const saveGrowthLog = (log, email = '') => {
  const storageKey = getStorageKey(email)
  const savedLogs = getSavedGrowthLogs(email)
  const nextLogs = [normalizeGrowthLog(log), ...savedLogs]

  window.localStorage.setItem(storageKey, JSON.stringify(nextLogs))

  if (normalizeEmail(email)) {
    window.localStorage.removeItem(GROWTH_LOGS_STORAGE_KEY)
  }

  return nextLogs
}
