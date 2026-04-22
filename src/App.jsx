import React, { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import Home from './pages/Home'
import About from './pages/About'
import ParentDashboard from './pages/Parentdashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminDoctorsSection from './pages/AdminDoctorsSection'
import AdminFeedbackSection from './pages/AdminFeedbackSection'
import AdminResourcesSection from './pages/AdminResourcesSection'
import AdminUsersSection from './pages/AdminUsersSection'
import AdminAppointmentsSection from './pages/AdminAppointmentsSection'
import DashboardLayout from './layouts/DashboardLayout'
import DoctorDashboard from './pages/DoctorDashboard'
import { getLoggedInUser } from './utils/navigation'
import ViewBabyProfile from "./pages/ViewBabyProfile"
import VaccinationSection from './pages/VaccinationSection'
import AppointmentSection from './pages/AppointmentSection'
import GrowthSection from './pages/GrowthSection'
import NotesSection from './pages/NotesSection'
import ParentResourcesSection from './pages/ParentResourcesSection'
import DoctorProfilePage from './pages/DoctorProfilePage'
import PrescriptionSection from './pages/PrescriptionSection'
import ParentFeedbackSection from './pages/ParentFeedbackSection'

const ProtectedDashboardLayout = () => {
  const authUser = getLoggedInUser()

  if (!authUser) {
    return <Navigate replace to="/login" />
  }

  return <DashboardLayout />
}

const RoleDashboardHome = () => {
  const authUser = getLoggedInUser()

  if (authUser?.role === 'admin') {
    return <AdminDashboard />
  }

  if (authUser?.role === 'doctor') {
    return <DoctorDashboard />
  }

  return <ParentDashboard />
}

const GuestOnlyRoute = ({ children }) => {
  const authUser = getLoggedInUser()

  if (authUser) {
    return <Navigate replace to="/dashboard" />
  }

  return children
}

const RoleRoute = ({ allowedRoles, children }) => {
  const authUser = getLoggedInUser()

  if (!authUser || !allowedRoles.includes(authUser.role)) {
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
        <Route path="/about" element={<About />} />
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
          <Route index element={<RoleDashboardHome />} />
          <Route path="admin/users" element={<RoleRoute allowedRoles={['admin']}><AdminUsersSection /></RoleRoute>} />
          <Route path="admin/doctors" element={<RoleRoute allowedRoles={['admin']}><AdminDoctorsSection /></RoleRoute>} />
          <Route path="admin/resources" element={<RoleRoute allowedRoles={['admin']}><AdminResourcesSection /></RoleRoute>} />
          <Route path="admin/feedback" element={<RoleRoute allowedRoles={['admin']}><AdminFeedbackSection /></RoleRoute>} />
          <Route path="admin/appointments" element={<RoleRoute allowedRoles={['admin']}><AdminAppointmentsSection /></RoleRoute>} />
          <Route path="profile" element={<ViewBabyProfile />} />
          <Route path="vaccination" element={<VaccinationSection />} />
          <Route path="appointment" element={<AppointmentSection />} />
          <Route path="growth" element={<GrowthSection />} />
          <Route path="notes" element={<NotesSection />} />
          <Route path="prescription" element={<RoleRoute allowedRoles={['doctor', 'parent']}><PrescriptionSection /></RoleRoute>} />
          <Route path="feedback" element={<RoleRoute allowedRoles={['parent']}><ParentFeedbackSection /></RoleRoute>} />
          <Route path="resources" element={<ParentResourcesSection />} />
          <Route path="doctor-profile" element={<RoleRoute allowedRoles={['doctor']}><DoctorProfilePage /></RoleRoute>} />
        </Route>
      </Routes>

      {!hideFooter && <Footer />}
    </>
  )
}

export default App
