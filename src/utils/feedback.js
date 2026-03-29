const FEEDBACK_REPLIES_STORAGE_KEY = 'babyBloomFeedbackReplies'
const FEEDBACK_RESOLVED_STORAGE_KEY = 'babyBloomFeedbackResolved'
const FEEDBACK_STORAGE_KEY = 'babyBloomFeedback'
const REMOVED_SEED_FEEDBACK_STORAGE_KEY = 'babyBloomRemovedSeedFeedback'
const APPROVED_HOMEPAGE_FEEDBACK_STORAGE_KEY = 'babyBloomApprovedHomepageFeedback'

const feedbackEntries = [
  {
    id: 'feedback-sarah',
    name: 'Sarah Johnson',
    feedback: "This platform helped me keep track of my baby's vaccination schedule easily. Highly recommend for new parents.",
    rating: 5,
    channel: 'App review',
  },
  {
    id: 'feedback-emily',
    name: 'Emily Brown',
    feedback: "The pediatrician consultation feature is amazing. I got quick advice for my baby's health concerns.",
    rating: 5,
    channel: 'Support follow-up',
  },
  {
    id: 'feedback-michael',
    name: 'Michael Davis',
    feedback: "The growth tracking feature is fantastic. I can monitor my baby's development and milestones effortlessly.",
    rating: 4,
    channel: 'App review',
  },
  {
    id: 'feedback-olivia',
    name: 'Olivia Wilson',
    feedback: 'The feeding log makes daily routines much easier to manage. I can quickly check when my baby last ate.',
    rating: 5,
    channel: 'Survey',
  },
  {
    id: 'feedback-james',
    name: 'James Taylor',
    feedback: "I like how simple the app is to use. Tracking sleep patterns has helped us understand our baby's schedule better.",
    rating: 4,
    channel: 'Survey',
  },
  {
    id: 'feedback-sophia',
    name: 'Sophia Martinez',
    feedback: 'The milestone updates are very helpful and reassuring. It feels good to keep everything organized in one place.',
    rating: 5,
    channel: 'App review',
  },
  {
    id: 'feedback-daniel',
    name: 'Daniel Anderson',
    feedback: 'The reminders are useful and keep us from missing important checkups and vaccinations.',
    rating: 4,
    channel: 'App review',
  },
  {
    id: 'feedback-ava',
    name: 'Ava Thomas',
    feedback: 'This app saves me time every day. I can track health notes, feeding, and growth without any confusion.',
    rating: 5,
    channel: 'Support follow-up',
  },
  {
    id: 'feedback-priya',
    name: 'Priya Nair',
    feedback: 'The appointment reminders and vaccine timeline helped our family stay ahead without juggling multiple notebooks.',
    rating: 5,
    channel: 'App review',
  },
  {
    id: 'feedback-karthik',
    name: 'Karthik Menon',
    feedback: 'I appreciate how quickly I can check feeding history before our pediatrician visits. It makes conversations much easier.',
    rating: 4,
    channel: 'Survey',
  },
  {
    id: 'feedback-neha',
    name: 'Neha Arora',
    feedback: 'The growth tracking charts are easy to understand and gave me more confidence during the first year.',
    rating: 5,
    channel: 'Parent interview',
  },
  {
    id: 'feedback-farhan',
    name: 'Farhan Ali',
    feedback: 'We started using BabyBloom for reminders, but the shared care notes became the feature we use most as working parents.',
    rating: 5,
    channel: 'Email follow-up',
  },
  {
    id: 'feedback-ishita',
    name: 'Ishita Kapoor',
    feedback: 'The overall experience feels calm and organized. I would love even more milestone content, but the core tools are excellent.',
    rating: 4,
    channel: 'App review',
  },
  {
    id: 'feedback-rhea',
    name: 'Rhea Dsouza',
    feedback: 'The resource section gave us practical answers during late-night worries, and the doctor directory feels reassuring.',
    rating: 5,
    channel: 'Support follow-up',
  },
]

const DEFAULT_APPROVED_HOMEPAGE_FEEDBACK_IDS = feedbackEntries.map((entry) => entry.id)

const isPrivateFeedbackChannel = (channel = '') => channel.toLowerCase() === 'parent dashboard'

const normalizeFeedback = (entry = {}) => ({
  id: entry.id ?? `feedback-${Date.now()}`,
  name: entry.name ?? 'Anonymous parent',
  feedback: entry.feedback ?? '',
  rating: Number(entry.rating ?? 5),
  channel: entry.channel ?? 'Parent feedback',
  source: entry.source ?? 'custom',
  visibility:
    entry.visibility ?? (isPrivateFeedbackChannel(entry.channel) ? 'private' : 'public'),
})

const readStoredFeedback = () => {
  const saved = window.localStorage.getItem(FEEDBACK_STORAGE_KEY)

  if (!saved) {
    return []
  }

  try {
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const readStoredReplies = () => {
  const savedReplies = window.localStorage.getItem(FEEDBACK_REPLIES_STORAGE_KEY)

  if (!savedReplies) {
    return {}
  }

  try {
    const parsedReplies = JSON.parse(savedReplies)
    return parsedReplies && typeof parsedReplies === 'object' ? parsedReplies : {}
  } catch {
    return {}
  }
}

const readRemovedSeedFeedback = () => {
  const saved = window.localStorage.getItem(REMOVED_SEED_FEEDBACK_STORAGE_KEY)
  if (!saved) return []
  try {
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const readApprovedHomepageFeedbackIds = () => {
  const saved = window.localStorage.getItem(APPROVED_HOMEPAGE_FEEDBACK_STORAGE_KEY)

  if (!saved) {
    return DEFAULT_APPROVED_HOMEPAGE_FEEDBACK_IDS
  }

  try {
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : DEFAULT_APPROVED_HOMEPAGE_FEEDBACK_IDS
  } catch {
    return DEFAULT_APPROVED_HOMEPAGE_FEEDBACK_IDS
  }
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

const readResolvedFeedback = () => {
  const saved = window.localStorage.getItem(FEEDBACK_RESOLVED_STORAGE_KEY)
  if (!saved) return []
  try {
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const resolveFeedback = (feedbackId) => {
  const resolved = readResolvedFeedback()
  if (!resolved.includes(feedbackId)) {
    resolved.push(feedbackId)
    window.localStorage.setItem(FEEDBACK_RESOLVED_STORAGE_KEY, JSON.stringify(resolved))
  }
  return getFeedbackEntries()
}

export const getSavedFeedback = () =>
  readStoredFeedback().map((entry) => normalizeFeedback(entry))

export const getFeedbackEntries = () => {
  const storedReplies = readStoredReplies()
  const resolved = readResolvedFeedback()
  const approvedHomepageIds = new Set(readApprovedHomepageFeedbackIds())
  const savedFeedback = getSavedFeedback()
  const savedIds = new Set(savedFeedback.map((entry) => entry.id))
  const hiddenSeedIds = new Set(readRemovedSeedFeedback())
  const defaultFeed = feedbackEntries
    .map((entry) => normalizeFeedback({ ...entry, source: 'seed' }))
    .filter((entry) => !hiddenSeedIds.has(entry.id) && !savedIds.has(entry.id))

  return [...defaultFeed, ...savedFeedback]
    .filter((entry) => !resolved.includes(entry.id))
    .map((entry) => ({
      ...entry,
      isPrivate: entry.visibility === 'private',
      isHomepageApproved:
        entry.visibility !== 'private' && approvedHomepageIds.has(entry.id),
      reply: normalizeReply(storedReplies[entry.id]),
    }))
}

export const getPublicFeedbackEntries = () =>
  getFeedbackEntries().filter((entry) => !entry.isPrivate && entry.isHomepageApproved)

export const saveFeedbackEntry = (entry) => {
  const normalizedEntry = normalizeFeedback({
    ...entry,
    id: entry.id ?? `custom-feedback-${Date.now()}`,
    source: 'custom',
  })
  const savedFeedback = getSavedFeedback()
  const existingIndex = savedFeedback.findIndex((item) => item.id === normalizedEntry.id)
  const nextFeedback = [...savedFeedback]

  if (existingIndex >= 0) {
    nextFeedback[existingIndex] = {
      ...nextFeedback[existingIndex],
      ...normalizedEntry,
    }
  } else {
    nextFeedback.unshift(normalizedEntry)
  }

  window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(nextFeedback))

  return nextFeedback
}

export const saveFeedbackReply = (feedbackId, message) => {
  const nextReplies = {
    ...readStoredReplies(),
    [feedbackId]: {
      author: 'Admin',
      message: message.trim(),
      updatedAt: new Date().toISOString(),
    },
  }

  window.localStorage.setItem(FEEDBACK_REPLIES_STORAGE_KEY, JSON.stringify(nextReplies))

  return getFeedbackEntries()
}

export const setFeedbackHomepageApproval = (feedbackId, isApproved) => {
  const approvedIds = new Set(readApprovedHomepageFeedbackIds())

  if (isApproved) {
    approvedIds.add(feedbackId)
  } else {
    approvedIds.delete(feedbackId)
  }

  window.localStorage.setItem(
    APPROVED_HOMEPAGE_FEEDBACK_STORAGE_KEY,
    JSON.stringify([...approvedIds])
  )

  return getFeedbackEntries()
}

export const convertFeedbackToTestimonial = (feedbackId) => {
  const sourceEntry = getFeedbackEntries().find((entry) => entry.id === feedbackId)

  if (!sourceEntry) {
    return getFeedbackEntries()
  }

  const convertedEntry = normalizeFeedback({
    name: sourceEntry.name,
    feedback: sourceEntry.feedback,
    rating: sourceEntry.rating,
    channel: 'Curated testimonial',
    visibility: 'public',
    source: 'custom',
  })

  const savedFeedback = getSavedFeedback()
  const nextFeedback = [convertedEntry, ...savedFeedback]
  window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(nextFeedback))

  const approvedIds = new Set(readApprovedHomepageFeedbackIds())
  approvedIds.add(convertedEntry.id)
  window.localStorage.setItem(
    APPROVED_HOMEPAGE_FEEDBACK_STORAGE_KEY,
    JSON.stringify([...approvedIds])
  )

  return getFeedbackEntries()
}

export const deleteFeedbackEntry = (feedbackId) => {
  const nextFeedback = getSavedFeedback().filter((entry) => entry.id !== feedbackId)
  window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(nextFeedback))

  const seedIds = new Set(feedbackEntries.map((entry) => entry.id))
  if (seedIds.has(feedbackId)) {
    const removedSeedFeedback = readRemovedSeedFeedback()
    if (!removedSeedFeedback.includes(feedbackId)) {
      removedSeedFeedback.push(feedbackId)
      window.localStorage.setItem(
        REMOVED_SEED_FEEDBACK_STORAGE_KEY,
        JSON.stringify(removedSeedFeedback)
      )
    }
  }

  const resolved = readResolvedFeedback().filter((entryId) => entryId !== feedbackId)
  window.localStorage.setItem(FEEDBACK_RESOLVED_STORAGE_KEY, JSON.stringify(resolved))

  const approvedIds = readApprovedHomepageFeedbackIds().filter((entryId) => entryId !== feedbackId)
  window.localStorage.setItem(
    APPROVED_HOMEPAGE_FEEDBACK_STORAGE_KEY,
    JSON.stringify(approvedIds)
  )

  return getFeedbackEntries()
}
