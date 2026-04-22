import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../components/style/parentdashboard.css'
import { getLoggedInUser } from '../utils/navigation'
import { getAdminDashboardData, deleteUser } from '../utils/adminDashboard'

const AdminUsersSection = () => {
  const [refreshTick, setRefreshTick] = useState(0)
  const [toastMessage, setToastMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 8

  const loggedInUser = getLoggedInUser()
  const dashboardData = getAdminDashboardData()

  useEffect(() => {
    if (!toastMessage) return
    const timeoutId = window.setTimeout(() => setToastMessage(''), 2800)
    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  const handleDelete = (email) => {
    if (window.confirm(`Are you sure you want to delete the user profile for ${email}? This action cannot be undone.`)) {
      deleteUser(email)
      setToastMessage('User data removed successfully.')
      setRefreshTick((t) => t + 1)
    }
  }


  const getProfileStatus = (entry) => {
    if (!entry.activeBabies.length) {
      return 'Setup needed'
    }

    if (entry.missingDobCount > 0) {
      return 'Needs DOB'
    }

    if (entry.completionRate >= 100) {
      return 'Complete'
    }

    return 'In progress'
  }

  const filteredFamilies = dashboardData.familySnapshots.filter((entry) => {
    const matchesSearch =
      entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.familyType.toLowerCase().includes(searchQuery.toLowerCase())

    const status = getProfileStatus(entry)
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'complete' && status === 'Complete') ||
      (statusFilter === 'twins' && entry.familyType === 'twins')

    return matchesSearch && matchesStatus
  })
  const totalPages = Math.max(1, Math.ceil(filteredFamilies.length / PAGE_SIZE))
  const paginatedFamilies = filteredFamilies.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, dashboardData.familySnapshots.length])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const completeProfilesCount = dashboardData.familySnapshots.filter(
    (entry) => getProfileStatus(entry) === 'Complete'
  ).length
  const twinsCount = dashboardData.familySnapshots.filter(
    (entry) => entry.familyType === 'twins'
  ).length

  const accessChecklist = [
    {
      label: 'Family accounts',
      value: `${dashboardData.totalFamilies} saved`,
      copy: `${dashboardData.totalActiveBabies} active baby profile${dashboardData.totalActiveBabies === 1 ? '' : 's'} across all families.`,
    },
    {
      label: 'Complete profiles',
      value: completeProfilesCount,
      copy: 'Family accounts with all core baby details saved.',
    },
    {
      label: 'Twins accounts',
      value: twinsCount,
      copy: 'Family workspaces configured for Twin A and Twin B.',
    },
  ]

  return (
    <section className="dashboard-section-panel parent-dashboard-page">
      <div className="dashboard-overview-hero mb-4">
        <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
          <div>
            <span className="dashboard-section-card-label">Family accounts</span>
            <h2 className="h3 mt-2 mb-3">Manage parent accounts</h2>
            <p className="mb-0 text-muted">
              Search family workspaces, update account emails, and remove saved records when needed.
            </p>
          </div>

          <div className="dashboard-overview-status" aria-label="User management summary">
            <span className="dashboard-save-badge">Account controls</span>
            <p className="mb-0">Signed in as {loggedInUser?.email || 'No email found'}.</p>
            <p className="mb-0">Use this page to manage saved family workspaces and account records.</p>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {accessChecklist.map((item) => (
          <div className="col-md-6 col-xl-3" key={item.label}>
            <article className="dashboard-section-card h-100">
              <span className="dashboard-section-card-label">{item.label}</span>
              <h3>{item.value}</h3>
              <p className="mb-0">{item.copy}</p>
            </article>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12">
          <article className="dashboard-twin-summary-card h-100">
            <div className="d-flex justify-content-between gap-3 align-items-start mb-3">
              <div>
                <span className="dashboard-section-card-label">Recent activity</span>
                <h3 className="h5 mt-2 mb-1">Latest saved records</h3>
              </div>
              <span className="dashboard-save-badge">
                {dashboardData.recentActivity.length} recent item{dashboardData.recentActivity.length === 1 ? '' : 's'}
              </span>
            </div>

            {dashboardData.recentActivity.length ? (
              <div className="growth-log-list">
                {dashboardData.recentActivity.map((item) => (
                  <article className="growth-log-card" key={item.id}>
                    <div className="growth-log-header">
                      <div>
                        <span className="dashboard-section-card-label">{item.type}</span>
                        <h4>{item.title}</h4>
                      </div>
                      <span className="growth-chip">{item.dateLabel}</span>
                    </div>
                    <div className="growth-log-meta">
                      <span>{item.subtitle}</span>
                      <span>{item.email}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="dashboard-profile-empty-state">
                No saved activity yet. Appointments, notes, and growth logs will appear here.
              </div>
            )}
          </article>
        </div>
      </div>

      <article className="dashboard-twin-summary-card">
        <div className="admin-section-header">
          <div>
            <span className="dashboard-section-card-label">Accounts directory</span>
            <h3 className="h5 mt-2 mb-1">Family account records</h3>
            <p className="dashboard-inline-hint mb-0">
              Review every saved family account in one place and take action without opening each profile.
            </p>
          </div>
          <span className="dashboard-save-badge">
            {filteredFamilies.length} of {dashboardData.familySnapshots.length}
          </span>
        </div>

        <div className="admin-toolbar">
          <input
            type="search"
            className="form-control admin-search-input"
            placeholder="Search by email or family type"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <select
            className="form-select admin-filter-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All accounts</option>
            <option value="complete">Complete</option>
            <option value="twins">Twins only</option>
          </select>
        </div>

        {filteredFamilies.length ? (
          <div className="admin-table-shell">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Family Type</th>
                  <th>Active Babies</th>
                  <th>Completion</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFamilies.map((entry) => {
                  const status = getProfileStatus(entry)
                  const statusClass =
                    status === 'Complete'
                      ? 'admin-status-badge admin-status-success'
                      : status === 'Needs DOB'
                        ? 'admin-status-badge admin-status-warning'
                        : 'admin-status-badge admin-status-muted'

                  return (
                    <tr key={entry.email}>
                      <td data-label="Account">
                        <div className="admin-table-primary">
                          <strong>{entry.email}</strong>
                          <span className="dashboard-inline-hint">
                            {entry.missingDobCount > 0
                              ? `${entry.missingDobCount} profile${entry.missingDobCount === 1 ? '' : 's'} missing DOB`
                              : 'Core baby records available'}
                          </span>
                        </div>
                      </td>
                      <td data-label="Family Type">
                        {entry.familyType === 'twins' ? 'Twins' : 'Single baby'}
                      </td>
                      <td data-label="Active Babies">
                        {entry.activeBabies.length}
                      </td>
                      <td data-label="Completion">
                        <div className="admin-progress-cell">
                          <div className="admin-progress-track">
                            <span
                              className="admin-progress-fill"
                              style={{ width: `${entry.completionRate}%` }}
                            />
                          </div>
                          <span>{entry.completionRate}%</span>
                        </div>
                      </td>
                      <td data-label="Status">
                        <span className={statusClass}>{status}</span>
                      </td>
                      <td data-label="Actions">
                        <div className="admin-table-actions">
                          <Link
                            className="btn btn-outline-secondary btn-sm"
                            to={`/dashboard/profile?email=${encodeURIComponent(entry.email)}`}
                          >
                            View Full Profile
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(entry.email)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-profile-empty-state">
            {dashboardData.familySnapshots.length === 0 
              ? 'No family profiles are stored yet, so there is nothing to summarize here.'
              : 'No profiles match your search query.'}
          </div>
        )}

        {filteredFamilies.length > PAGE_SIZE && (
          <div className="admin-pagination">
            <p className="dashboard-inline-hint mb-0">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}-
              {Math.min(currentPage * PAGE_SIZE, filteredFamilies.length)} of {filteredFamilies.length} accounts
            </p>
            <div className="admin-pagination-actions">
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="admin-page-indicator">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </article>

      {toastMessage && (
        <div className="dashboard-toast" role="status" aria-live="polite">
          <strong>Notification</strong>
          <p className="mb-0">{toastMessage}</p>
        </div>
      )}
    </section>
  )
}

export default AdminUsersSection
