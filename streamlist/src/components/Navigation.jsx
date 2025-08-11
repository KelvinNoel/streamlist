import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  // Get current route to highlight active nav item
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* App logo/brand - clicking goes to home */}
        <Link to="/" className="nav-logo">
          <i className="fas fa-stream"></i>
          StreamList
        </Link>
        
        {/* Main navigation menu */}
        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <i className="fas fa-home"></i>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/movies" 
              className={`nav-link ${location.pathname === '/movies' ? 'active' : ''}`}
            >
              <i className="fas fa-film"></i>
              Movies
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/discover" 
              className={`nav-link ${location.pathname === '/discover' ? 'active' : ''}`}
            >
              <i className="fas fa-search"></i>
              Discover
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/cart" 
              className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
            >
              <i className="fas fa-shopping-cart"></i>
              Cart
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/about" 
              className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
            >
              <i className="fas fa-info-circle"></i>
              About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation