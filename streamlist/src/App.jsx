// App.js - Fixed version with correct extensions
import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'
import NotFound from './components/NotFound.jsx'
import InstallButton from './components/InstallButton.jsx'
import './App.css'

// Lazy load components for better performance
const StreamList = React.lazy(() => import('./components/StreamList'))
const Movies = React.lazy(() => import('./components/Movies'))
const Discover = React.lazy(() => import('./components/discover'))
const About = React.lazy(() => import('./components/About'))
const Cart = React.lazy(() => import('./components/Cart'))

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          {/* Main navigation bar - stays visible on all pages */}
          <Navigation />
          
          {/* Main content area where page components render */}
          <main className="main-content">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Home page - shows streaming content */}
                <Route path="/" element={<StreamList />} />
                
                {/* Movies catalog page */}
                <Route path="/movies" element={<Movies />} />
                
                {/* Movie discovery with filters and search */}
                <Route path="/discover" element={<Discover />} />
                
                {/* Shopping cart for rentals/purchases */}
                <Route path="/cart" element={<Cart />} />
                
                {/* About/info page */}
                <Route path="/about" element={<About />} />
                
                {/* 404 page for unmatched routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          
          {/* PWA Install Button - shows when app can be installed */}
          <InstallButton />
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App