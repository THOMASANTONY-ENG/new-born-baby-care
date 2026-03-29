const SHARED_RESOURCES_PREFIX = 'babySharedResources:'

export const getSharedResources = (patientEmail) => {
  if (!patientEmail) return []
  const savedData = window.localStorage.getItem(`${SHARED_RESOURCES_PREFIX}${patientEmail}`)
  try {
    return savedData ? JSON.parse(savedData) : []
  } catch {
    return []
  }
}

export const shareResourceWithPatient = (patientEmail, resource) => {
  if (!patientEmail || !resource) return []

  const currentResources = getSharedResources(patientEmail)

  // Prevent sharing the identical resource multiple times
  if (currentResources.some((res) => res.id === resource.id)) {
    return currentResources
  }

  const nextResources = [{ ...resource, sharedAt: new Date().toISOString() }, ...currentResources]
  window.localStorage.setItem(
    `${SHARED_RESOURCES_PREFIX}${patientEmail}`,
    JSON.stringify(nextResources)
  )

  return nextResources
}

export const removeSharedResource = (patientEmail, resourceId) => {
  if (!patientEmail || !resourceId) return []

  const currentResources = getSharedResources(patientEmail)
  const nextResources = currentResources.filter((res) => res.id !== resourceId)

  window.localStorage.setItem(
    `${SHARED_RESOURCES_PREFIX}${patientEmail}`,
    JSON.stringify(nextResources)
  )

  return nextResources
}
