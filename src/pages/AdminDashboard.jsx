import React from 'react'
import { Link } from 'react-router-dom'
import '../components/style/parentdashboard.css'
import { getAvailableDoctors, getSavedDoctors } from '../utils/doctors'
import { getFeedbackEntries } from '../utils/feedback'
import { getLoggedInUser } from '../utils/navigation'
import { getAvailableResources, getSavedResources } from '../utils/resources'
import { getAdminDashboardData } from '../utils/adminDashboard'
import { getContactMessages } from '../utils/contactMessages'

const AdminDashboard = () => {
  const loggedInUser = getLoggedInUser()
  const dashboardData = getAdminDashboardData()
  const allDoctors = getAvailableDoctors()
  const savedDoctors = getSavedDoctors()
  const resources = getAvailableResources()
  const savedResources = getSavedResources()
  const feedbackEntries = getFeedbackEntries()
  const contactMessages = getContactMessages()
  const privateFeedbackCount = feedbackEntries.filter((entry) => entry.isPrivate).length
  const approvedTestimonialCount = feedbackEntries.filter((entry) => entry.isHomepageApproved).length
  const repliedFeedbackCount = feedbackEntries.filter((entry) => entry.reply).length
  const repliedContactCount = contactMessages.filter((entry) => entry.reply).length
  const pendingContactCount = contactMessages.filter((entry) => !entry.reply).length

  const overviewCards = [
    {
      label: 'Family Accounts',
      value: dashboardData.totalFamilies,
      copy: `${dashboardData.totalActiveBabies} active baby profile${dashboardData.totalActiveBabies === 1 ? '' : 's'} across saved family workspaces.`,
    },
    {
      label: 'Private Feedback',
      value: privateFeedbackCount,
      copy: 'Parent dashboard feedback that stays internal for admin review.',
    },
    {
      label: 'Contact Inbox',
      value: contactMessages.length,
      copy: `${pendingContactCount} message${pendingContactCount === 1 ? '' : 's'} still waiting for an admin reply.`,
    },
    {
      label: 'Approved Testimonials',
      value: approvedTestimonialCount,
      copy: 'Curated public reviews currently approved for the homepage.',
    },
    {
      label: 'Upcoming Visits',
      value: dashboardData.upcomingAppointments,
      copy: `${dashboardData.totalAppointments} appointment${dashboardData.totalAppointments === 1 ? '' : 's'} saved in total.`,
    },
    {
      label: 'Replies',
      value: repliedFeedbackCount + repliedContactCount,
      copy: 'Admin responses already saved across feedback and contact conversations.',
    },
    {
      label: 'Pediatricians',
      value: allDoctors.length,
      copy: `${allDoctors.length} pediatrician profile${allDoctors.length === 1 ? '' : 's'} are currently in the directory.`,
    },
  ]

  const adminModules = [
    {
      title: 'Feedback and Contact Inbox',
      path: '/dashboard/admin/feedback',
      copy: 'Review private parent feedback, reply to contact messages, and approve testimonials for homepage.',
    },
    {
      title: 'Family Accounts',
      path: '/dashboard/admin/users',
      copy: 'Search family workspaces, update account emails, and manage saved parent records.',
    },
    {
      title: 'Pediatricians',
      path: '/dashboard/admin/doctors',
      copy: 'Add or remove doctor profiles that appear in bookings and the homepage directory.',
    },
    {
      title: 'Resources',
      path: '/dashboard/admin/resources',
      copy: 'Manage educational cards shown to parents and pediatricians on the public site.',
    },
    {
      title: 'Appointments',
      path: '/dashboard/admin/appointments',
      copy: 'Monitor and manage all medical bookings and clinical statuses across the entire system.',
    },
  ]

  return (
    <section className="dashboard-section-panel parent-dashboard-page">
      <div className="dashboard-overview-hero mb-4">
        <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
          <div>
            <span className="dashboard-section-card-label">Admin overview</span>
            <h2 className="h3 mt-2 mb-3">BabyBloom admin home</h2>
            <p className="mb-0 text-muted">
              Start with inbox work and active family records, then move into the management module that matches the task.
            </p>
          </div>

          <div className="dashboard-overview-status" aria-label="Admin account summary">
            <span className="dashboard-save-badge">Admin session</span>
            <p className="mb-0">Signed in as {loggedInUser?.email || 'No email found'}.</p>
            <p className="mb-0">{pendingContactCount} pending contact message{pendingContactCount === 1 ? '' : 's'} need review.</p>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {overviewCards.map((card) => (
          <div className="col-md-6 col-xl-4" key={card.label}>
            <article className="dashboard-section-card h-100">
              <span className="dashboard-section-card-label">{card.label}</span>
              <h3>{card.value}</h3>
              <p className="mb-0">{card.copy}</p>
            </article>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <article className="dashboard-twin-summary-card h-100">
            <div className="d-flex justify-content-between gap-3 align-items-start mb-3">
              <div>
                <span className="dashboard-section-card-label">Primary workflow</span>
                <h3 className="h5 mt-2 mb-1">Open the module you need</h3>
              </div>
              <span className="dashboard-save-badge">{adminModules.length} modules</span>
            </div>

            <div className="row g-3">
              {adminModules.map((module) => (
                <div className="col-md-6" key={module.path}>
                  <article className={`dashboard-profile-mini-card h-100${module.path === '/dashboard/admin/feedback' ? ' admin-primary-module-card' : ''}`}>
                    <span className="dashboard-section-card-label">Module</span>
                    <strong>{module.title}</strong>
                    <p className="mt-2 mb-3">{module.copy}</p>
                    <Link className={`btn btn-sm${module.path === '/dashboard/admin/feedback' ? ' btn-primary' : ' btn-outline-primary'}`} to={module.path}>
                      Open module
                    </Link>
                  </article>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="col-lg-5">
          <article className="dashboard-twin-summary-card h-100">
            <div className="d-flex justify-content-between gap-3 align-items-start mb-3">
              <div>
                <span className="dashboard-section-card-label">Recent activity</span>
                <h3 className="h5 mt-2 mb-1">Latest saved records</h3>
              </div>
              <span className="dashboard-save-badge">
                {dashboardData.recentActivity.length} item{dashboardData.recentActivity.length === 1 ? '' : 's'}
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
                No recent activity yet. Saved appointments, notes, and growth updates will appear here.
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard
