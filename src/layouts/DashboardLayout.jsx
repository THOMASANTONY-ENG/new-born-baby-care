import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import '../components/style/dashboardlayout.css'
import { getLoggedInUser, logoutLoggedInUser } from '../utils/navigation'

const pageTitles = {
  '/dashboard': 'Dashboard Overview',
  '/dashboard/profile': 'Baby Profile',
  '/dashboard/vaccination': 'Vaccination Schedule',
  '/dashboard/appointment': 'Appointments',
  '/dashboard/growth': 'Growth Tracking',
  '/dashboard/notes': 'Care Notes',
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
    navigate('/login')
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span className="dashboard-topbar-label">{roleLabels[role]} Dashboard</span>
            <h1 className="dashboard-topbar-title mb-1">
              {pageTitles[location.pathname] ?? 'BabyBloom Dashboard'}
            </h1>
            <p className="dashboard-topbar-copy mb-0">
              Signed in as {loggedInUser?.email || 'guest'}.
            </p>
          </div>

          <button className="btn btn-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <div className="dashboard-page-shell">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
