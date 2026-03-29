const CONTACT_MESSAGES_STORAGE_KEY = 'babyBloomContacts'
const CONTACT_REPLIES_STORAGE_KEY = 'babyBloomContactReplies'
const CONTACT_RESOLVED_STORAGE_KEY = 'babyBloomContactResolved'

const readJson = (key, fallback) => {
  const saved = window.localStorage.getItem(key)

  if (!saved) {
    return fallback
  }

  try {
    const parsed = JSON.parse(saved)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const readStoredMessages = () => {
  const saved = readJson(CONTACT_MESSAGES_STORAGE_KEY, [])
  return Array.isArray(saved) ? saved : []
}

const readStoredReplies = () => {
  const saved = readJson(CONTACT_REPLIES_STORAGE_KEY, {})
  return saved && typeof saved === 'object' ? saved : {}
}

const readResolvedMessages = () => {
  const saved = readJson(CONTACT_RESOLVED_STORAGE_KEY, [])
  return Array.isArray(saved) ? saved : []
}

const normalizeReply = (reply = {}) => {
  if (!reply.message) {
    return null
  }

  return {
    author: reply.author ?? 'Admin',
    message: reply.message,
    updatedAt: reply.updatedAt ?? new Date().toISOString(),
  }
}

const normalizeMessage = (entry, index, replies) => ({
  id: entry.id ?? `contact-${entry.submittedAt ?? index}`,
  name: entry.name ?? 'Anonymous user',
  email: entry.email ?? 'No email',
  message: entry.message ?? '',
  submittedAt: entry.submittedAt ?? new Date().toISOString(),
  channel: 'Contact form',
  reply: normalizeReply(replies[entry.id ?? `contact-${entry.submittedAt ?? index}`]),
})

export const saveContactMessage = (message) => {
  const nextMessage = {
    id: `contact-${Date.now()}`,
    name: message.name.trim(),
    email: message.email.trim(),
    message: message.message.trim(),
    submittedAt: new Date().toISOString(),
  }

  const existing = readStoredMessages()
  existing.unshift(nextMessage)
  window.localStorage.setItem(CONTACT_MESSAGES_STORAGE_KEY, JSON.stringify(existing))

  return nextMessage
}

export const getContactMessages = () => {
  const messages = readStoredMessages()
  const replies = readStoredReplies()
  const resolved = readResolvedMessages()

  return messages
    .filter((entry, index) => {
      const id = entry.id ?? `contact-${entry.submittedAt ?? index}`
      return !resolved.includes(id)
    })
    .map((entry, index) => normalizeMessage(entry, index, replies))
}

export const saveContactReply = (messageId, message) => {
  const nextReplies = {
    ...readStoredReplies(),
    [messageId]: {
      author: 'Admin',
      message: message.trim(),
      updatedAt: new Date().toISOString(),
    },
  }

  window.localStorage.setItem(CONTACT_REPLIES_STORAGE_KEY, JSON.stringify(nextReplies))
  return getContactMessages()
}

export const resolveContactMessage = (messageId) => {
  const resolved = readResolvedMessages()
  if (!resolved.includes(messageId)) {
    resolved.push(messageId)
    window.localStorage.setItem(CONTACT_RESOLVED_STORAGE_KEY, JSON.stringify(resolved))
  }

  return getContactMessages()
}
