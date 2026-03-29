import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import '../components/style/dashboardlayout.css'
import { getLoggedInUser, logoutLoggedInUser } from '../utils/navigation'

const pageTitles = {
  '/dashboard': {
    parent: 'Care Overview',
    admin: 'Admin Overview',
    doctor: 'Doctor Overview',
  },
  '/dashboard/profile': 'Baby Profile',
  '/dashboard/vaccination': 'Vaccination Schedule',
  '/dashboard/appointment': 'Appointments',
  '/dashboard/growth': 'Growth Tracking',
  '/dashboard/notes': 'Care Notes',
  '/dashboard/feedback': 'Parent Feedback',
  '/dashboard/resources': 'Educational Resources',
  '/dashboard/doctor-profile': 'My Profile',
  '/dashboard/admin/users': 'Family Accounts',
  '/dashboard/admin/doctors': 'Pediatrician Management',
  '/dashboard/admin/resources': 'Resource Management',
  '/dashboard/admin/feedback': 'Feedback and Contact Inbox',
}

const roleLabels = {
  parent: 'Parent',
  doctor: 'Doctor',
  admin: 'Admin',
}

const DashboardLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'

  const handleLogout = () => {
    logoutLoggedInUser()
    window.location.replace('/login')
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-topbar-title mb-1">
              {typeof pageTitles[location.pathname] === 'object'
                ? pageTitles[location.pathname][role] ?? 'BabyBloom Dashboard'
                : pageTitles[location.pathname] ?? 'BabyBloom Dashboard'}
            </h1>
            <p className="dashboard-topbar-copy mb-0">
              Signed in as {loggedInUser?.email || 'guest'}.
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              className="topbar-action-btn topbar-btn-home"
              onClick={() => navigate('/')}
              title="Back to Home"
            >
              ← Home
            </button>
            <button
              className="topbar-action-btn topbar-btn-logout"
              onClick={handleLogout}
              title="Log out"
            >
              Log out
            </button>
          </div>
        </header>

        <div className="dashboard-page-shell">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
