import React, { useEffect, useState } from 'react'
import '../components/style/parentdashboard.css'
import {
  deleteResource,
  getAvailableResources,
  getSavedResources,
  saveResource,
} from '../utils/resources'

const initialResourceForm = {
  id: '',
  title: '',
  audience: 'Parents',
  description: '',
  image: '',
}

const AdminResourcesSection = () => {
  const [resourceForm, setResourceForm] = useState(initialResourceForm)
  const [savedResources, setSavedResources] = useState(() => getSavedResources())
  const [toastMessage, setToastMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [audienceFilter, setAudienceFilter] = useState('all')

  useEffect(() => {
    if (!toastMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 2800)

    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  const resourceCatalog = getAvailableResources()
  const resourceLibrary = resourceCatalog.filter((resource) => {
    const normalizedQuery = searchQuery.toLowerCase()
    const matchesSearch =
      resource.title.toLowerCase().includes(normalizedQuery) ||
      resource.description.toLowerCase().includes(normalizedQuery) ||
      resource.audience.toLowerCase().includes(normalizedQuery)
    const matchesAudience =
      audienceFilter === 'all' ||
      resource.audience.toLowerCase() === audienceFilter ||
      (audienceFilter === 'shared' && resource.audience === 'Parents and pediatricians')

    return matchesSearch && matchesAudience
  })

  const handleResourceChange = (event) => {
    const { name, value } = event.target

    setResourceForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setResourceForm((current) => ({
        ...current,
        image: e.target.result,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSaveResource = (event) => {
    event.preventDefault()

    const nextSavedResources = saveResource({
      id: resourceForm.id || undefined,
      title: resourceForm.title.trim(),
      audience: resourceForm.audience,
      description: resourceForm.description.trim(),
      image: resourceForm.image || undefined,
    })

    setSavedResources(nextSavedResources)
    setResourceForm(initialResourceForm)
    setToastMessage('Educational resource saved to the shared library.')
  }

  const handleDeleteResource = (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      const nextSavedResources = deleteResource(resourceId)
      setSavedResources(nextSavedResources)
      if (resourceForm.id === resourceId) {
        setResourceForm(initialResourceForm)
      }
      setToastMessage('Resource removed from the shared library.')
    }
  }

  const handleEditResource = (resource) => {
    setResourceForm({
      id: resource.id,
      title: resource.title,
      audience: resource.audience,
      description: resource.description,
      image: resource.image || '',
    })
  }

  return (
    <section className="dashboard-section-panel parent-dashboard-page">
      <div className="dashboard-overview-hero mb-4">
        <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
          <div>
            <span className="dashboard-section-card-label">Content and resource management</span>
            <h2 className="h3 mt-2 mb-3">Educational resource library</h2>
            <p className="mb-0 text-muted">
              Create admin-managed learning cards for parents and pediatricians.
            </p>
          </div>

          <div className="dashboard-overview-status" aria-label="Resource management summary">
            <span className="dashboard-save-badge">{resourceCatalog.length} total</span>
            <p className="mb-0">
              {savedResources.length} admin-managed resource{savedResources.length === 1 ? '' : 's'} saved.
            </p>
            <p className="mb-0">New items appear on the public educational section right away.</p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
          <article className="dashboard-twin-summary-card h-100">
            <span className="dashboard-section-card-label">Create resource</span>
            <h3 className="h5 mt-2 mb-3">{resourceForm.id ? 'Edit resource card' : 'Add a new card'}</h3>
            <p className="mb-4 text-muted">
              Save a short topic card and assign the right audience.
            </p>

            <form onSubmit={handleSaveResource}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="resourceTitle">
                    Resource title
                  </label>
                  <input
                    className="form-control"
                    id="resourceTitle"
                    name="title"
                    type="text"
                    value={resourceForm.title}
                    onChange={handleResourceChange}
                    placeholder="Infant hydration guide"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="resourceAudience">
                    Audience
                  </label>
                  <select
                    className="form-select"
                    id="resourceAudience"
                    name="audience"
                    value={resourceForm.audience}
                    onChange={handleResourceChange}
                  >
                    <option value="Parents">Parents</option>
                    <option value="Pediatricians">Pediatricians</option>
                    <option value="Parents and pediatricians">Parents and pediatricians</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="resourceDescription">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="resourceDescription"
                    name="description"
                    rows="4"
                    value={resourceForm.description}
                    onChange={handleResourceChange}
                    placeholder="Add a short summary of what the audience will learn."
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="resourceImage">
                    Cover image
                    <span className="text-muted ms-2" style={{ fontWeight: 400, fontSize: '0.82rem' }}>(optional)</span>
                  </label>

                  {resourceForm.image && (
                    <div className="mb-2" style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={resourceForm.image}
                        alt="Resource preview"
                        style={{
                          width: '100%',
                          maxHeight: '160px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                          border: '1.5px solid var(--color-border, #e2e8f0)',
                        }}
                      />
                      <button
                        type="button"
                        aria-label="Remove image"
                        onClick={() => setResourceForm((current) => ({ ...current, image: '' }))}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: 'rgba(0,0,0,0.55)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '26px',
                          height: '26px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          lineHeight: '26px',
                          textAlign: 'center',
                          padding: 0,
                        }}
                      >
                        x
                      </button>
                    </div>
                  )}

                  <input
                    className="form-control"
                    id="resourceImage"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="form-text">Upload a JPG, PNG, or WEBP image. Stored locally in your browser.</div>
                </div>

                <div className="col-12">
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary" type="submit">
                      {resourceForm.id ? 'Update Resource' : 'Save Resource'}
                    </button>
                    {resourceForm.id && (
                      <button
                        className="btn btn-outline-danger"
                        type="button"
                        onClick={() => setResourceForm(initialResourceForm)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </article>
        </div>

        <div className="col-xl-7">
          <article className="dashboard-twin-summary-card h-100">
            <div className="admin-section-header">
              <div>
                <span className="dashboard-section-card-label">Content library</span>
                <h3 className="h5 mt-2 mb-1">Educational resources in rotation</h3>
                <p className="dashboard-inline-hint mb-0">
                  Browse the full resource library with quick search and audience filters.
                </p>
              </div>
              <span className="dashboard-save-badge">
                {resourceLibrary.length} of {resourceCatalog.length}
              </span>
            </div>

            <div className="admin-toolbar">
              <input
                className="form-control admin-search-input"
                type="search"
                placeholder="Search by title, audience, or description"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <select
                className="form-select admin-filter-select"
                value={audienceFilter}
                onChange={(event) => setAudienceFilter(event.target.value)}
              >
                <option value="all">All audiences</option>
                <option value="parents">Parents</option>
                <option value="pediatricians">Pediatricians</option>
                <option value="shared">Parents and pediatricians</option>
              </select>
            </div>

            <div className="admin-summary-strip">
              <div className="admin-summary-pill">
                <strong>{resourceCatalog.length}</strong>
                <span>Total resources</span>
              </div>
              <div className="admin-summary-pill">
                <strong>{savedResources.length}</strong>
                <span>Admin-managed</span>
              </div>
              <div className="admin-summary-pill">
                <strong>{resourceCatalog.filter((resource) => resource.image).length}</strong>
                <span>With imagery</span>
              </div>
            </div>

            {resourceLibrary.length ? (
              <div className="admin-record-list">
                {resourceLibrary.map((resource) => (
                  <article className="admin-record-card" key={resource.id}>
                    {resource.image && (
                      <img
                        src={resource.image}
                        alt={resource.title}
                        className="admin-record-cover"
                        style={{
                          width: '100%',
                          height: '140px',
                          objectFit: 'cover',
                          borderRadius: '14px',
                          marginBottom: '16px',
                          display: 'block',
                        }}
                      />
                    )}
                    <div className="admin-record-main">
                      <div className="admin-record-title-row">
                        <div>
                          <span className="dashboard-section-card-label">{resource.audience}</span>
                          <h4>{resource.title}</h4>
                        </div>
                        <span className="growth-chip">
                          {resource.source === 'custom' ? 'Editable' : 'Preloaded'}
                        </span>
                      </div>
                      <p className="mb-3">{resource.description}</p>
                      <div className="admin-meta-row">
                        <span>{resource.source === 'custom' ? 'Managed by admin' : 'Built-in content'}</span>
                        <span>{resource.image ? 'Image assigned' : 'No image'}</span>
                      </div>
                    </div>
                    <div className="admin-record-actions">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        type="button"
                        onClick={() => handleEditResource(resource)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        type="button"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="dashboard-profile-empty-state">
                No resources are available yet. Add one to start the content library.
              </div>
            )}
          </article>
        </div>
      </div>

      {toastMessage && (
        <div className="dashboard-toast" role="status" aria-live="polite">
          <strong>Saved</strong>
          <p className="mb-0">{toastMessage}</p>
        </div>
      )}
    </section>
  )
}

export default AdminResourcesSection
