import React, { useState } from 'react'

// Import your 5 downloaded icons here
import FilmIcon from '../assets/icons/film.svg' // or .png
import PlusIcon from '../assets/icons/plus.svg'
import FireIcon from '../assets/icons/fire.svg'
import PlayIcon from '../assets/icons/play.svg'
import DeleteIcon from '../assets/icons/delete.svg'

function StreamList() {
  const [streamItems, setStreamItems] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    priority: 'medium',
    notes: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (formData.title.trim()) {
      const newItem = {
        id: Date.now(),
        ...formData,
        dateAdded: new Date().toLocaleDateString()
      }
      
      setStreamItems(prev => [...prev, newItem])
      console.log('New stream item added:', newItem)
      console.log('All stream items:', [...streamItems, newItem])
      
      // Reset form
      setFormData({
        title: '',
        genre: '',
        priority: 'medium',
        notes: ''
      })
    }
  }

  const deleteItem = (id) => {
    setStreamItems(prev => prev.filter(item => item.id !== id))
  }

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'high': return FireIcon
      case 'medium': return FilmIcon
      case 'low': return FilmIcon
      default: return FilmIcon
    }
  }

  const getGenreIcon = (genre) => {
    // Using FilmIcon for all genres since we only have 5 icons
    return FilmIcon
  }

  return (
    <div className="streamlist-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <img src={FilmIcon} alt="Stream" className="hero-icon" />
            My Stream List
            <div className="title-glow"></div>
          </h1>
          <p className="hero-subtitle">
            Create your personalized watchlist and never miss a great show again
          </p>
          <div className="stats-bar">
            <div className="stat-item">
              <img src={FilmIcon} alt="List" className="stat-icon" />
              <span>{streamItems.length} Items</span>
            </div>
            <div className="stat-item">
              <img src={FireIcon} alt="Fire" className="stat-icon" />
              <span>{streamItems.filter(item => item.priority === 'high').length} High Priority</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="form-section">
        <div className="form-header">
          <h2>
            <img src={PlusIcon} alt="Plus" className="section-icon" />
            Add New Title
          </h2>
          <div className="form-divider"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="stream-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">
                <img src={FilmIcon} alt="Film" className="label-icon" />
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter movie/show title"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="genre">
                <img src={FilmIcon} alt="Tags" className="label-icon" />
                Genre
              </label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select Genre</option>
                <option value="action"> Action</option>
                <option value="comedy"> Comedy</option>
                <option value="drama">Drama</option>
                <option value="horror">Horror</option>
                <option value="romance"> Romance</option>
                <option value="sci-fi"> Sci-Fi</option>
                <option value="thriller"> Thriller</option>
                <option value="documentary"> Documentary</option>
                <option value="animation"> Animation</option>
                <option value="other"> Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                <img src={FireIcon} alt="Flag" className="label-icon" />
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">
              <img src={FilmIcon} alt="Note" className="label-icon" />
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any notes about this title..."
              rows="3"
              className="form-textarea"
            />
          </div>

          <button type="submit" className="submit-btn">
            <img src={PlusIcon} alt="Plus" className="btn-icon" />
            <span>Add to Stream List</span>
            <div className="btn-glow"></div>
          </button>
        </form>
      </div>

      {/* Stream List Section */}
      <div className="stream-list-section">
        {streamItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <img src={FilmIcon} alt="Film" className="empty-main-icon" />
              <div className="icon-rings">
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
                <div className="ring ring-3"></div>
              </div>
            </div>
            <h3>Your stream list is empty</h3>
            <p>Add your first movie or show above to get started!</p>
          </div>
        ) : (
          <div className="stream-list">
            <div className="list-header">
              <h2>
                <img src={FilmIcon} alt="List" className="section-icon" />
                Your Stream List ({streamItems.length} items)
              </h2>
              <div className="list-controls">
                <button className="control-btn">
                  <img src={FilmIcon} alt="Sort" className="control-icon" />
                  Sort
                </button>
                <button className="control-btn">
                  <img src={FilmIcon} alt="Filter" className="control-icon" />
                  Filter
                </button>
              </div>
            </div>
            
            <div className="stream-grid">
              {streamItems.map((item, index) => (
                <div key={item.id} className={`stream-card priority-${item.priority}`} style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="card-header">
                    <div className="title-section">
                      <h3 className="card-title">{item.title}</h3>
                      {item.genre && (
                        <div className="genre-tag">
                          <img src={getGenreIcon(item.genre)} alt={item.genre} className="genre-icon" />
                          {item.genre}
                        </div>
                      )}
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteItem(item.id)}
                      title="Remove from list"
                    >
                      <img src={DeleteIcon} alt="Delete" className="delete-icon" />
                    </button>
                  </div>
                  
                  <div className="card-content">
                    <div className="priority-section">
                      <div className={`priority-badge priority-${item.priority}`}>
                        <img src={getPriorityIcon(item.priority)} alt={item.priority} className="priority-icon" />
                        <span>{item.priority}</span>
                      </div>
                      <div className="date-added">
                        <img src={FilmIcon} alt="Calendar" className="date-icon" />
                        {item.dateAdded}
                      </div>
                    </div>
                    
                    {item.notes && (
                      <div className="notes-section">
                        <img src={FilmIcon} alt="Quote" className="quote-icon" />
                        <p className="notes-text">{item.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-actions">
                    <button className="action-btn watch-btn">
                      <img src={PlayIcon} alt="Play" className="action-icon" />
                      Mark as Watched
                    </button>
                    <button className="action-btn edit-btn">
                      <img src={FilmIcon} alt="Edit" className="action-icon" />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StreamList