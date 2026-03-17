import React, { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import Home from './pages/Home'
import ParentDashboard from './pages/Parentdashboard'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardSection from './pages/DashboardSection'
import { getLoggedInUser } from './utils/navigation'

const ProtectedDashboardLayout = () => {
  const authUser = getLoggedInUser()

  if (!authUser) {
    return <Navigate replace to="/login" />
  }

  return <DashboardLayout />
}

const GuestOnlyRoute = ({ children }) => {
  const authUser = getLoggedInUser()

  if (authUser) {
    return <Navigate replace to="/dashboard" />
  }

  return children
}

const App = () => {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const isDashboardPage = location.pathname.startsWith('/dashboard')
  const hideNavbar = isAuthPage || isDashboardPage
  const hideFooter = isDashboardPage

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const sectionId = location.hash.replace('#', '')
    const section = document.getElementById(sectionId)

    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location])

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/register"
          element={
            <GuestOnlyRoute>
              <RegisterPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <LoginPage />
            </GuestOnlyRoute>
          }
        />
        <Route path="/dashboard" element={<ProtectedDashboardLayout />}>
          <Route index element={<ParentDashboard />} />
          <Route
            path="vaccination"
            element={
              <DashboardSection
                title="Vaccination Schedule"
                description="Track due vaccines and keep doctor visits prepared."
              />
            }
          />
          <Route
            path="appointment"
            element={
              <DashboardSection
                title="Appointments"
                description="Keep visit plans, follow-ups, and care questions together."
              />
            }
          />
          <Route
            path="growth"
            element={
              <DashboardSection
                title="Growth Tracking"
                description="Follow weight, height, and development updates in one place."
              />
            }
          />
          <Route
            path="notes"
            element={
              <DashboardSection
                title="Care Notes"
                description="Save daily observations and health reminders for quick review."
              />
            }
          />
        </Route>
      </Routes>

      {!hideFooter && <Footer />}
    </>
  )
}

export default App
