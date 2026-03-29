import nutrition from '../assets/nutrition.jpg'
import hero1 from '../assets/hero1.jpg'
import doc1 from '../assets/doc1.jpg'
import doc6 from '../assets/doc6.png'

const RESOURCES_STORAGE_KEY = 'babyBloomResources'
const REMOVED_SEED_RESOURCES_STORAGE_KEY = 'babyBloomRemovedSeedResources'

const defaultResources = [
  {
    id: 'resource-nutrition',
    title: 'Newborn Nutrition',
    description: 'Learn breastfeeding basics, formula guidance, and healthy feeding routines for the first months.',
    audience: 'Parents',
    image: nutrition,
    source: 'seed',
  },
  {
    id: 'resource-sleep',
    title: 'Sleep Routine Tips',
    description: 'Build a gentle sleep schedule and understand how to support better rest for your baby.',
    audience: 'Parents',
    image: hero1,
    source: 'seed',
  },
  {
    id: 'resource-vaccination',
    title: 'Vaccination Guide',
    description: 'Follow recommended vaccine timelines and understand what to expect during each visit.',
    audience: 'Parents',
    image: doc6,
    source: 'seed',
  },
  {
    id: 'resource-wellness',
    title: 'Baby Wellness Checks',
    description: 'Know when to schedule checkups, what signs to watch, and when to speak with a doctor.',
    audience: 'Parents and pediatricians',
    image: doc1,
    source: 'seed',
  },
]

const pickResourceImage = (audience = '') =>
  audience.toLowerCase().includes('doctor') || audience.toLowerCase().includes('pediatrician')
    ? doc1
    : doc6

const normalizeResource = (resource = {}) => ({
  id: resource.id ?? `resource-${Date.now()}`,
  title: resource.title ?? 'Untitled resource',
  description: resource.description ?? 'No description added.',
  audience: resource.audience ?? 'Parents',
  image: resource.image ?? pickResourceImage(resource.audience),
  source: resource.source ?? 'custom',
})

const readRemovedSeedResources = () => {
  const saved = window.localStorage.getItem(REMOVED_SEED_RESOURCES_STORAGE_KEY)

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

const readStoredResources = () => {
  const savedResources = window.localStorage.getItem(RESOURCES_STORAGE_KEY)

  if (!savedResources) {
    return []
  }

  try {
    const parsedResources = JSON.parse(savedResources)
    return Array.isArray(parsedResources) ? parsedResources : []
  } catch {
    return []
  }
}

export const getSavedResources = () => readStoredResources().map((resource) => normalizeResource(resource))

export const getAvailableResources = () => {
  const savedResources = getSavedResources()
  const savedIds = new Set(savedResources.map((resource) => resource.id))
  const hiddenSeedIds = new Set(readRemovedSeedResources())
  const defaultLibrary = defaultResources
    .map((resource) => normalizeResource({ ...resource, source: 'seed' }))
    .filter((resource) => !hiddenSeedIds.has(resource.id) && !savedIds.has(resource.id))

  return [...defaultLibrary, ...savedResources]
}

export const saveResource = (resource) => {
  const normalizedResource = normalizeResource({
    ...resource,
    id: resource.id ?? `custom-resource-${Date.now()}`,
    source: 'custom',
  })
  const savedResources = getSavedResources()
  const existingIndex = savedResources.findIndex((r) => r.id === normalizedResource.id)
  const nextResources = [...savedResources]
  
  if (existingIndex >= 0) {
    nextResources[existingIndex] = {
      ...nextResources[existingIndex],
      ...normalizedResource
    }
  } else {
    nextResources.unshift(normalizedResource)
  }

  window.localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(nextResources))

  return nextResources
}

export const deleteResource = (resourceId) => {
  const nextResources = getSavedResources().filter((resource) => resource.id !== resourceId)
  window.localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(nextResources))

  const seedIds = new Set(defaultResources.map((resource) => resource.id))
  if (seedIds.has(resourceId)) {
    const removedSeedResources = readRemovedSeedResources()
    if (!removedSeedResources.includes(resourceId)) {
      removedSeedResources.push(resourceId)
      window.localStorage.setItem(
        REMOVED_SEED_RESOURCES_STORAGE_KEY,
        JSON.stringify(removedSeedResources)
      )
    }
  }

  return nextResources
}
