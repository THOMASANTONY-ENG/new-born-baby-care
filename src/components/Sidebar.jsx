import { NavLink } from 'react-router-dom'
import {
  FaBaby,
  FaClipboardList,
  FaFolderOpen,
  FaHome,
  FaLock,
  FaSyringe,
  FaUserMd,
  FaUserCircle,
  FaChartLine,
  FaStickyNote,
  FaCommentDots,
} from 'react-icons/fa'
import { getLoggedInUser } from '../utils/navigation'

const roleMenu = {
  parent: [
    { name: 'Dashboard', path: '/dashboard', icon: <FaHome /> },
    { name: 'Baby Profile', path: '/dashboard/profile', icon: <FaBaby /> },
    { name: 'Vaccination', path: '/dashboard/vaccination', icon: <FaSyringe /> },
    { name: 'Appointments', path: '/dashboard/appointment', icon: <FaUserMd /> },
    { name: 'Growth', path: '/dashboard/growth', icon: <FaChartLine /> },
    { name: 'Notes', path: '/dashboard/notes', icon: <FaStickyNote /> },
    { name: 'Prescriptions', path: '/dashboard/prescription', icon: <FaClipboardList /> },
    { name: 'Feedback', path: '/dashboard/feedback', icon: <FaCommentDots /> },
    { name: 'Resources', path: '/dashboard/resources', icon: <FaFolderOpen /> },
  ],
  admin: [
    { name: 'Overview', path: '/dashboard', icon: <FaClipboardList /> },
    { name: 'Family Accounts', path: '/dashboard/admin/users', icon: <FaLock /> },
    { name: 'Pediatricians', path: '/dashboard/admin/doctors', icon: <FaUserMd /> },
    { name: 'Resources', path: '/dashboard/admin/resources', icon: <FaFolderOpen /> },
    { name: 'Inbox', path: '/dashboard/admin/feedback', icon: <FaStickyNote /> },
  ],
  doctor: [
    { name: 'Overview', path: '/dashboard', icon: <FaHome /> },
    { name: 'Appointments', path: '/dashboard/appointment', icon: <FaUserMd /> },
    { name: 'Growth', path: '/dashboard/growth', icon: <FaChartLine /> },
    { name: 'Notes', path: '/dashboard/notes', icon: <FaStickyNote /> },
    { name: 'Prescriptions', path: '/dashboard/prescription', icon: <FaClipboardList /> },
    { name: 'My Profile', path: '/dashboard/doctor-profile', icon: <FaUserCircle /> },
  ],
}

const sidebarCopy = {
  parent: 'Move between profile, vaccines, visits, growth, feedback, and notes in one place.',
  admin: 'Move between the dedicated admin workspaces for users, pediatricians, resources, and the shared inbox.',
  doctor: 'Review the family care routes and stay aligned with saved appointments, growth, and notes.',
}

const sidebarSummary = {
  parent: 'Start from the dashboard, then jump into the care task you need.',
  admin: 'Start from overview, then open the admin module that matches the task you need to complete.',
  doctor: 'Start from the overview, then move into the care records you need to review.',
}

const Sidebar = () => {
  const loggedInUser = getLoggedInUser()
  const role = loggedInUser?.role ?? 'parent'
  const menu = roleMenu[role] ?? roleMenu.parent

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-eyebrow">Care Hub</span>
        <h4 className="logo mb-0">BabyBloom</h4>
        <p className="sidebar-copy mb-0">{sidebarCopy[role] ?? sidebarCopy.parent}</p>
      </div>

      <ul className="menu">
        {menu.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => (isActive ? 'active' : '')}
              end={item.path === '/dashboard'}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-summary">
        <span className="sidebar-summary-label">Today</span>
        <strong>{sidebarSummary[role] ?? sidebarSummary.parent}</strong>
      </div>

    </aside>
  )
}

export default Sidebar
