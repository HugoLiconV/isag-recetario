import { NavLink } from 'react-router-dom'
import './BottomTabBar.css'

export default function BottomTabBar() {
  return (
    <nav className="tab-bar">
      <NavLink to="/" end className={({ isActive }) => `tab-bar__tab${isActive ? ' tab-bar__tab--active' : ''}`}>
        <svg className="tab-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="tab-bar__label">Inicio</span>
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => `tab-bar__tab${isActive ? ' tab-bar__tab--active' : ''}`}>
        <svg className="tab-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="tab-bar__label">Buscar</span>
      </NavLink>
    </nav>
  )
}
