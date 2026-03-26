import { NavLink } from 'react-router-dom'
import {
  FaBaby,
  FaHome,
  FaSyringe,
  FaUserMd,
  FaChartLine,
  FaStickyNote,
} from 'react-icons/fa'

const menu = [
  { name: 'Dashboard', path: '/dashboard', icon: <FaHome /> },
  { name: 'Baby Profile', path: '/dashboard/profile', icon: <FaBaby /> },
  { name: 'Vaccination', path: '/dashboard/vaccination', icon: <FaSyringe /> },
  { name: 'Appointments', path: '/dashboard/appointment', icon: <FaUserMd /> },
  { name: 'Growth', path: '/dashboard/growth', icon: <FaChartLine /> },
  { name: 'Notes', path: '/dashboard/notes', icon: <FaStickyNote /> },
]

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-eyebrow">Care Hub</span>
        <h4 className="logo mb-0">BabyBloom</h4>
        <p className="sidebar-copy mb-0">
          Move between profile, vaccines, visits, growth, and notes in one place.
        </p>
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
        <strong>Start from the dashboard, then jump into the care task you need.</strong>
      </div>
    </aside>
  )
}

export default Sidebar
