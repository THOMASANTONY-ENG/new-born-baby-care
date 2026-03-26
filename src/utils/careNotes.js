const CARE_NOTES_STORAGE_KEY = 'babyCareNotes'
const CARE_NOTES_STORAGE_PREFIX = `${CARE_NOTES_STORAGE_KEY}:`

const normalizeEmail = (email = '') => email.trim().toLowerCase()

const getStorageKey = (email = '') => {
  const normalizedEmail = normalizeEmail(email)

  return normalizedEmail
    ? `${CARE_NOTES_STORAGE_PREFIX}${normalizedEmail}`
    : CARE_NOTES_STORAGE_KEY
}

const readStoredCareNotes = (storageKey) => {
  const savedNotes = window.localStorage.getItem(storageKey)

  if (!savedNotes) {
    return []
  }

  try {
    const parsedNotes = JSON.parse(savedNotes)
    return Array.isArray(parsedNotes) ? parsedNotes : []
  } catch {
    return []
  }
}

const normalizeCareNote = (note = {}) => ({
  id: note.id ?? `${Date.now()}`,
  babyLabel: note.babyLabel ?? 'Family',
  babyName: note.babyName ?? 'Family',
  category: note.category ?? 'Daily care',
  noteDate: note.noteDate ?? '',
  title: note.title ?? '',
  content: note.content ?? '',
  createdAt: note.createdAt ?? new Date().toISOString(),
  updatedAt: note.updatedAt ?? note.createdAt ?? new Date().toISOString(),
})

const compareNotes = (left, right) => {
  const noteDateComparison = (right.noteDate || '').localeCompare(left.noteDate || '')

  if (noteDateComparison !== 0) {
    return noteDateComparison
  }

  return (right.updatedAt || '').localeCompare(left.updatedAt || '')
}

export const getSavedCareNotes = (email = '') =>
  readStoredCareNotes(getStorageKey(email))
    .map((note) => normalizeCareNote(note))
    .sort(compareNotes)

export const saveCareNote = (note, email = '') => {
  const storageKey = getStorageKey(email)
  const normalizedNote = normalizeCareNote(note)
  const savedNotes = getSavedCareNotes(email)
  const existingNoteIndex = savedNotes.findIndex((savedNote) => savedNote.id === normalizedNote.id)
  const nextNotes = [...savedNotes]

  if (existingNoteIndex >= 0) {
    nextNotes[existingNoteIndex] = {
      ...nextNotes[existingNoteIndex],
      ...normalizedNote,
      createdAt: nextNotes[existingNoteIndex].createdAt,
      updatedAt: normalizedNote.updatedAt ?? new Date().toISOString(),
    }
  } else {
    nextNotes.unshift(normalizedNote)
  }

  const sortedNotes = nextNotes.sort(compareNotes)

  window.localStorage.setItem(storageKey, JSON.stringify(sortedNotes))

  if (normalizeEmail(email)) {
    window.localStorage.removeItem(CARE_NOTES_STORAGE_KEY)
  }

  return sortedNotes
}

export const deleteCareNote = (noteId, email = '') => {
  const storageKey = getStorageKey(email)
  const nextNotes = getSavedCareNotes(email).filter((note) => note.id !== noteId)

  window.localStorage.setItem(storageKey, JSON.stringify(nextNotes))

  if (normalizeEmail(email)) {
    window.localStorage.removeItem(CARE_NOTES_STORAGE_KEY)
  }

  return nextNotes
}
