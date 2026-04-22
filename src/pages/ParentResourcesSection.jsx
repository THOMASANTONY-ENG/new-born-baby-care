import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import '../components/style/parentdashboard.css'
import { getLoggedInUser } from '../utils/navigation'
import { getAvailableResources } from '../utils/resources'
import { getSharedResources } from '../utils/sharedResources'

const categoryOptions = ['All', 'Nutrition', 'Sleep', 'Vaccination', 'Wellness', 'Shared by Doctor']

const getCategoryFromTitle = (title = '') => {
  const lower = title.toLowerCase()
  if (lower.includes('nutrition') || lower.includes('feeding')) return 'Nutrition'
  if (lower.includes('sleep')) return 'Sleep'
  if (lower.includes('vaccin')) return 'Vaccination'
  if (lower.includes('wellness') || lower.includes('checkup') || lower.includes('check')) return 'Wellness'
  return 'General'
}

const ParentResourcesSection = () => {
  const loggedInUser = getLoggedInUser()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const allResources = useMemo(() => getAvailableResources(), [])
  const sharedResources = useMemo(
    () => getSharedResources(loggedInUser?.email),
    [loggedInUser?.email]
  )

  const combinedResources = useMemo(() => {
    const sharedIds = new Set(sharedResources.map((r) => r.id))
    const tagged = allResources
      .filter((r) => !sharedIds.has(r.id))
      .map((r) => ({ ...r, origin: 'library', category: getCategoryFromTitle(r.title) }))
    const shared = sharedResources.map((r) => {
      const originalResource = allResources.find((ar) => ar.id === r.id)
      return {
        ...r,
        link: r.link || originalResource?.link || '',
        origin: 'doctor',
        category: 'Shared by Doctor',
      }
    })
    return [...shared, ...tagged]
  }, [allResources, sharedResources])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return combinedResources.filter((resource) => {
      const matchesCategory =
        activeCategory === 'All' || resource.category === activeCategory
      const matchesSearch =
        !query ||
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [combinedResources, activeCategory, search])

  const doctorSharedCount = sharedResources.length

  return (
    <section className="dashboard-section-panel parent-dashboard-page">
      <div className="dashboard-section-intro">
        <span className="dashboard-section-label">Learning centre</span>
        <h2 className="dashboard-section-title">Educational Resources</h2>
        <p className="dashboard-section-copy mb-0">
          Browse trusted articles and guides for newborn care. Resources shared by your doctor are
          highlighted at the top.
        </p>
      </div>

      {doctorSharedCount > 0 && (
        <div
          className="alert d-flex align-items-center gap-3 mb-4"
          style={{
            background: 'linear-gradient(135deg, #f0f4ff, #e8f0fe)',
            border: '1.5px solid #c7d7fb',
            borderRadius: '12px',
            color: '#1e3a7a',
          }}
          role="status"
        >
          <span style={{ fontSize: '1.4rem' }}>📋</span>
          <div>
            <strong>Doctor Recommendations</strong> — Your healthcare provider has shared{' '}
            {doctorSharedCount} resource{doctorSharedCount === 1 ? '' : 's'} with your family. They
            appear first below.
          </div>
        </div>
      )}

      {/* Search + filters */}
      <div className="d-flex flex-wrap gap-2 mb-4 align-items-center">
        <input
          type="search"
          className="form-control"
          id="resource-search"
          placeholder="Search resources…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '280px' }}
          aria-label="Search educational resources"
        />
        <div className="d-flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className="btn btn-sm"
              style={
                activeCategory === cat
                  ? {
                      background: 'rgba(223,244,239,0.95)',
                      color: '#467165',
                      border: '1.5px solid rgba(70,113,101,0.3)',
                      fontWeight: 700,
                    }
                  : {
                      background: 'transparent',
                      color: 'var(--text-soft)',
                      border: '1px solid rgba(93,115,159,0.2)',
                    }
              }
              aria-pressed={activeCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="dashboard-profile-empty-state">
          No resources match your search or filter. Try a different keyword or category.
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((resource) => (
            <div className="col-md-6 col-xl-4" key={`${resource.origin}-${resource.id}`}>
              <article
                className="dashboard-section-card h-100 d-flex flex-column"
                style={{
                  border:
                    resource.origin === 'doctor'
                      ? '2px solid #6339cb'
                      : '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  padding: 0,
                }}
              >
                {resource.image && (
                  <div style={{ height: '160px', overflow: 'hidden', flexShrink: 0 }}>
                    <img
                      src={resource.image}
                      alt={resource.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div className="d-flex flex-column flex-grow-1 p-3 gap-2">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <span className="dashboard-section-card-label">
                      {resource.origin === 'doctor' ? '🩺 Recommended by doctor' : resource.category}
                    </span>
                    {resource.origin === 'doctor' && (
                      <span
                        className="badge"
                        style={{ background: '#6339cb', color: '#fff', fontSize: '0.68rem' }}
                      >
                        Doctor's pick
                      </span>
                    )}
                  </div>

                  <h3 className="h6 mb-1" style={{ fontWeight: 700 }}>
                    {resource.title}
                  </h3>
                  <p className="text-muted small mb-0 flex-grow-1">{resource.description}</p>

                  {resource.origin === 'doctor' && resource.sharedAt && (
                    <p className="mb-0" style={{ fontSize: '0.75rem', color: '#888' }}>
                      Shared on {new Date(resource.sharedAt).toLocaleDateString()}
                    </p>
                  )}

                  {resource.link && (
                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm mt-auto align-self-start"
                    >
                      Learn More →
                    </a>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 pt-2">
        <div className="dashboard-section-card">
          <span className="dashboard-section-card-label">Need more help?</span>
          <h3 className="h6 mt-2 mb-2">Speak to a pediatrician</h3>
          <p className="mb-3 text-muted small">
            Your doctor can recommend additional reading materials directly to your account. Book an
            appointment to get personalised guidance.
          </p>
          <Link to="/dashboard/appointment" className="btn btn-primary btn-sm">
            View Appointments
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ParentResourcesSection
