import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Movies from './components/Movies'
import Discover from './components/discover'
import About from './components/About'
import Cart from './components/Cart'
import './App.css'
import StreamList from './components/StreamList'

function App() {
  return (
    <Router>
      <div className="App">
        {/* Main navigation bar - stays visible on all pages */}
        <Navigation />
        
        {/* Main content area where page components render */}
        <main className="main-content">
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
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App