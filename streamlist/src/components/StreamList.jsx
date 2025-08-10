import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Film, 
  Flame, 
  Play, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Star, 
  Calendar, 
  Filter, 
  SortAsc,
  Search,
  Eye,
  EyeOff,
  Heart,
  Clock,
  Zap,
  BookOpen,
  Award,
  TrendingUp,
  History,
  Save
} from 'lucide-react';
import './streamlist.css';

function StreamList() {
  const [streamItems, setStreamItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [showCompleted, setShowCompleted] = useState(true);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    priority: 'medium',
    notes: '',
    rating: 0
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    genre: '',
    priority: 'medium',
    notes: '',
    rating: 0
  });

  // Local Storage keys
  const STORAGE_KEYS = {
    STREAM_ITEMS: 'streamList_items',
    USER_EVENTS: 'streamList_userEvents',
    SEARCH_HISTORY: 'streamList_searchHistory',
    FILTERS: 'streamList_filters',
    RECENTLY_VIEWED: 'streamList_recentlyViewed',
    USER_PREFERENCES: 'streamList_preferences'
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Save to localStorage whenever streamItems changes
  useEffect(() => {
    if (streamItems.length > 0) {
      localStorage.setItem(STORAGE_KEYS.STREAM_ITEMS, JSON.stringify(streamItems));
    }
  }, [streamItems]);

  // Save filters to localStorage
  useEffect(() => {
    const filters = {
      searchTerm,
      filterGenre,
      filterPriority,
      sortBy,
      showCompleted
    };
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
  }, [searchTerm, filterGenre, filterPriority, sortBy, showCompleted]);

  // Load all data from localStorage
  const loadFromLocalStorage = () => {
    try {
      // Load stream items
      const savedItems = localStorage.getItem(STORAGE_KEYS.STREAM_ITEMS);
      if (savedItems) {
        setStreamItems(JSON.parse(savedItems));
      }

      // Load search history
      const savedSearchHistory = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      if (savedSearchHistory) {
        setSearchHistory(JSON.parse(savedSearchHistory));
      }

      // Load filters and preferences
      const savedFilters = localStorage.getItem(STORAGE_KEYS.FILTERS);
      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        setSearchTerm(filters.searchTerm || '');
        setFilterGenre(filters.filterGenre || '');
        setFilterPriority(filters.filterPriority || '');
        setSortBy(filters.sortBy || 'dateAdded');
        setShowCompleted(filters.showCompleted !== undefined ? filters.showCompleted : true);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  // Store user events in localStorage
  const storeUserEvent = (eventType, eventData = {}) => {
    try {
      const userEvents = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_EVENTS) || '[]');
      const newEvent = {
        id: Date.now(),
        type: eventType,
        timestamp: new Date().toISOString(),
        data: eventData
      };
      
      userEvents.unshift(newEvent);
      
      // Keep only last 100 events
      const limitedEvents = userEvents.slice(0, 100);
      localStorage.setItem(STORAGE_KEYS.USER_EVENTS, JSON.stringify(limitedEvents));
    } catch (error) {
      console.error('Error storing user event:', error);
    }
  };

  // Update search history
  const updateSearchHistory = (term) => {
    if (term.trim() && !searchHistory.includes(term)) {
      const newHistory = [term, ...searchHistory].slice(0, 10); // Keep last 10 searches
      setSearchHistory(newHistory);
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(newHistory));
      
      storeUserEvent('search', { searchTerm: term });
    }
  };

  // Store recently viewed items
  const storeRecentlyViewed = (item) => {
    try {
      const recentlyViewed = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED) || '[]');
      const filteredRecent = recentlyViewed.filter(recent => recent.id !== item.id);
      filteredRecent.unshift(item);
      
      // Keep only last 20 items
      const limitedRecent = filteredRecent.slice(0, 20);
      localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(limitedRecent));
    } catch (error) {
      console.error('Error storing recently viewed:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.title.trim()) {
      const newItem = {
        id: Date.now(),
        ...formData,
        rating: parseInt(formData.rating),
        dateAdded: new Date().toLocaleDateString(),
        completed: false,
        favorite: false,
        createdAt: new Date().toISOString()
      };
      
      setStreamItems(prev => [...prev, newItem]);
      
      // Store user event
      storeUserEvent('item_added', {
        itemId: newItem.id,
        title: newItem.title,
        genre: newItem.genre,
        priority: newItem.priority
      });
      
      // Reset form
      setFormData({
        title: '',
        genre: '',
        priority: 'medium',
        notes: '',
        rating: 0
      });
    }
  };

  const deleteItem = (id) => {
    const item = streamItems.find(item => item.id === id);
    setStreamItems(prev => prev.filter(item => item.id !== id));
    
    // Store user event
    storeUserEvent('item_deleted', {
      itemId: id,
      title: item?.title
    });
  };

  const toggleComplete = (id) => {
    const item = streamItems.find(item => item.id === id);
    const newCompletedState = !item.completed;
    
    setStreamItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: newCompletedState } : item
    ));
    
    // Store user event
    storeUserEvent(newCompletedState ? 'item_completed' : 'item_uncompleted', {
      itemId: id,
      title: item?.title
    });

    // If marking as completed, store in recently viewed
    if (newCompletedState && item) {
      storeRecentlyViewed(item);
    }
  };

  const toggleFavorite = (id) => {
    const item = streamItems.find(item => item.id === id);
    const newFavoriteState = !item.favorite;
    
    setStreamItems(prev => prev.map(item => 
      item.id === id ? { ...item, favorite: newFavoriteState } : item
    ));
    
    // Store user event
    storeUserEvent(newFavoriteState ? 'item_favorited' : 'item_unfavorited', {
      itemId: id,
      title: item?.title
    });
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditFormData({
      title: item.title,
      genre: item.genre,
      priority: item.priority,
      notes: item.notes,
      rating: item.rating
    });
    
    // Store user event
    storeUserEvent('item_edit_started', {
      itemId: item.id,
      title: item.title
    });
  };

  const saveEdit = (id) => {
    const item = streamItems.find(item => item.id === id);
    setStreamItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...editFormData, rating: parseInt(editFormData.rating) } : item
    ));
    
    // Store user event
    storeUserEvent('item_edited', {
      itemId: id,
      title: item?.title,
      changes: editFormData
    });
    
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({
      title: '',
      genre: '',
      priority: 'medium',
      notes: '',
      rating: 0
    });
    
    // Store user event
    storeUserEvent('item_edit_cancelled', {});
  };

  // Handle search with history
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      updateSearchHistory(value);
    }
  };

  // Handle search from history
  const handleSearchFromHistory = (term) => {
    setSearchTerm(term);
    setShowSearchHistory(false);
    storeUserEvent('search_from_history', { searchTerm: term });
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch(filterType) {
      case 'genre':
        setFilterGenre(value);
        storeUserEvent('filter_genre_changed', { genre: value });
        break;
      case 'priority':
        setFilterPriority(value);
        storeUserEvent('filter_priority_changed', { priority: value });
        break;
      case 'sort':
        setSortBy(value);
        storeUserEvent('sort_changed', { sortBy: value });
        break;
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'high': return <Flame className="priority-icon" />;
      case 'medium': return <Zap className="priority-icon" />;
      case 'low': return <Clock className="priority-icon" />;
      default: return <Film className="priority-icon" />;
    }
  };

  const getGenreIcon = (genre) => {
    const iconMap = {
      action: <Zap className="item-genre-icon" />,
      comedy: <Star className="item-genre-icon" />,
      drama: <BookOpen className="item-genre-icon" />,
      horror: <Eye className="item-genre-icon" />,
      romance: <Heart className="item-genre-icon" />,
      'sci-fi': <TrendingUp className="item-genre-icon" />,
      thriller: <Award className="item-genre-icon" />,
      documentary: <Film className="item-genre-icon" />,
      animation: <Star className="item-genre-icon" />,
      other: <Film className="item-genre-icon" />
    };
    return iconMap[genre] || <Film className="item-genre-icon" />;
  };

  // Export data functionality
  const exportData = () => {
    try {
      const dataToExport = {
        streamItems,
        userEvents: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_EVENTS) || '[]'),
        searchHistory,
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `streamlist_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      storeUserEvent('data_exported', { itemCount: streamItems.length });
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // Filter and sort items
  const filteredAndSortedItems = streamItems
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = !filterGenre || item.genre === filterGenre;
      const matchesPriority = !filterPriority || item.priority === filterPriority;
      const matchesCompleted = showCompleted || !item.completed;
      return matchesSearch && matchesGenre && matchesPriority && matchesCompleted;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'rating':
          return b.rating - a.rating;
        case 'genre':
          return a.genre.localeCompare(b.genre);
        default:
          return new Date(b.dateAdded) - new Date(a.dateAdded);
      }
    });

  const stats = {
    total: streamItems.length,
    completed: streamItems.filter(item => item.completed).length,
    highPriority: streamItems.filter(item => item.priority === 'high').length,
    favorites: streamItems.filter(item => item.favorite).length
  };

  return (
    <div className="streamlist-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-title-container">
            <Film className="hero-icon" />
            <h1 className="hero-title">StreamList Pro</h1>
          </div>
          <p className="hero-subtitle">
            Your ultimate entertainment companion. Track, rate, and organize your watchlist like never before.
          </p>
          
          {/* Stats Bar */}
          <div className="stats-grid">
            {[
              { icon: <Film className="stat-icon" />, label: 'Total Items', value: stats.total, colorClass: 'stat-icon-blue' },
              { icon: <Check className="stat-icon" />, label: 'Completed', value: stats.completed, colorClass: 'stat-icon-green' },
              { icon: <Flame className="stat-icon" />, label: 'High Priority', value: stats.highPriority, colorClass: 'stat-icon-red' },
              { icon: <Heart className="stat-icon" />, label: 'Favorites', value: stats.favorites, colorClass: 'stat-icon-pink' }
            ].map((stat, index) => (
              <div key={index} className="stat-card">
                <div className={`stat-icon-container ${stat.colorClass}`}>
                  {stat.icon}
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Data Management */}
          <div className="data-management">
            <button onClick={exportData} className="export-button">
              <Save className="export-icon" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Add New Item Section */}
        <div className="form-section">
          <div className="form-header">
            <Plus className="form-header-icon" />
            <h2 className="form-title">Add New Title</h2>
          </div>
          
          <div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <Film className="form-label-icon" />
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter movie/show title"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <BookOpen className="form-label-icon" />
                  Genre
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select Genre</option>
                  <option value="action">Action</option>
                  <option value="comedy">Comedy</option>
                  <option value="drama">Drama</option>
                  <option value="horror">Horror</option>
                  <option value="romance">Romance</option>
                  <option value="sci-fi">Sci-Fi</option>
                  <option value="thriller">Thriller</option>
                  <option value="documentary">Documentary</option>
                  <option value="animation">Animation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Flame className="form-label-icon" />
                  Priority
                </label>
                <select
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

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  <Star className="form-label-icon" />
                  Personal Rating (0-10)
                </label>
                <input
                  type="number"
                  name="rating"
                  min="0"
                  max="10"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Edit3 className="form-label-icon" />
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any notes about this title..."
                  rows="3"
                  className="form-input form-textarea"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="submit-button"
            >
              <Plus className="submit-button-icon" />
              Add to Stream List
            </button>
          </div>
        </div>

        {/* Controls Section */}
        <div className="controls-section">
          <div className="controls-container">
            <div className="controls-group">
              <div className="search-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search titles..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSearchHistory(true)}
                  className="search-input"
                />
                
                {/* Search History Dropdown */}
                {showSearchHistory && searchHistory.length > 0 && (
                  <div className="search-history-dropdown">
                    <div className="search-history-header">
                      <History className="history-icon" />
                      Recent Searches
                    </div>
                    {searchHistory.map((term, index) => (
                      <div 
                        key={index} 
                        className="search-history-item"
                        onClick={() => handleSearchFromHistory(term)}
                      >
                        <Clock className="history-item-icon" />
                        {term}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <select
                value={filterGenre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="filter-select"
              >
                <option value="">All Genres</option>
                <option value="action">Action</option>
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
                <option value="horror">Horror</option>
                <option value="romance">Romance</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="thriller">Thriller</option>
                <option value="documentary">Documentary</option>
                <option value="animation">Animation</option>
                <option value="other">Other</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="filter-select"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="filter-select"
              >
                <option value="dateAdded">Date Added</option>
                <option value="title">Title</option>
                <option value="priority">Priority</option>
                <option value="rating">Rating</option>
                <option value="genre">Genre</option>
              </select>
            </div>

            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`toggle-button ${showCompleted ? 'toggle-button-active' : 'toggle-button-inactive'}`}
            >
              {showCompleted ? <Eye className="toggle-icon" /> : <EyeOff className="toggle-icon" />}
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </button>
          </div>
        </div>

        {/* Stream List */}
        {filteredAndSortedItems.length === 0 ? (
          <div className="empty-state">
            <Film className="empty-icon" />
            <h3 className="empty-title">
              {streamItems.length === 0 ? 'Your stream list is empty' : 'No items match your filters'}
            </h3>
            <p className="empty-subtitle">
              {streamItems.length === 0 ? 'Add your first movie or show above to get started!' : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="items-grid">
            {filteredAndSortedItems.map((item, index) => (
              <div
                key={item.id}
                className={`item-card ${item.completed ? 'item-card-completed' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {editingId === item.id ? (
                  // Edit Mode
                  <div className="edit-form">
                    <input
                      type="text"
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditInputChange}
                      className="edit-input"
                    />
                    
                    <div className="edit-grid">
                      <select
                        name="genre"
                        value={editFormData.genre}
                        onChange={handleEditInputChange}
                        className="edit-input"
                      >
                        <option value="">Select Genre</option>
                        <option value="action">Action</option>
                        <option value="comedy">Comedy</option>
                        <option value="drama">Drama</option>
                        <option value="horror">Horror</option>
                        <option value="romance">Romance</option>
                        <option value="sci-fi">Sci-Fi</option>
                        <option value="thriller">Thriller</option>
                        <option value="documentary">Documentary</option>
                        <option value="animation">Animation</option>
                        <option value="other">Other</option>
                      </select>
                      
                      <select
                        name="priority"
                        value={editFormData.priority}
                        onChange={handleEditInputChange}
                        className="edit-input"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <input
                      type="number"
                      name="rating"
                      min="0"
                      max="10"
                      value={editFormData.rating}
                      onChange={handleEditInputChange}
                      placeholder="Rating (0-10)"
                      className="edit-input"
                    />
                    
                    <textarea
                      name="notes"
                      value={editFormData.notes}
                      onChange={handleEditInputChange}
                      placeholder="Notes..."
                      rows="2"
                      className="edit-textarea"
                    />
                    
                    <div className="edit-actions">
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="edit-save-button"
                      >
                        <Check className="edit-button-icon" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="edit-cancel-button"
                      >
                        <X className="edit-button-icon" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div>
                    <div className="item-header">
                      <div className="item-info">
                        <h3 className={`item-title ${item.completed ? 'item-title-completed' : ''}`}>
                          {item.title}
                        </h3>
                        {item.genre && (
                          <div className="item-genre">
                            {getGenreIcon(item.genre)}
                            <span className="item-genre-text">{item.genre}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="item-actions">
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className={`action-button favorite-button ${item.favorite ? 'favorite-button-active' : ''}`}
                        >
                          <Heart 
                            className="action-icon" 
                            fill={item.favorite ? 'currentColor' : 'none'}
                          />
                        </button>
                        
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="action-button delete-button"
                        >
                          <Trash2 className="action-icon" />
                        </button>
                      </div>
                    </div>

                    <div className="item-details">
                      <div className="item-detail-row">
                        <div className={`priority-badge priority-${item.priority}`}>
                          {getPriorityIcon(item.priority)}
                          <span className="priority-text">{item.priority}</span>
                        </div>
                        
                        {item.rating > 0 && (
                          <div className="rating-display">
                            <Star className="rating-icon" />
                            <span className="rating-text">{item.rating}/10</span>
                          </div>
                        )}
                      </div>

                      <div className="date-added">
                        <Calendar className="date-icon" />
                        Added {item.dateAdded}
                      </div>

                      {item.notes && (
                        <div className="notes-container">
                          <p className="notes-text">{item.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="item-actions-container">
                      <button
                        onClick={() => toggleComplete(item.id)}
                        className={`primary-action-button ${item.completed ? 'completed-button' : 'incomplete-button'}`}
                      >
                        {item.completed ? (
                          <>
                            <Check className="button-icon" />
                            Watched
                          </>
                        ) : (
                          <>
                            <Play className="button-icon" />
                            Mark Watched
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => startEdit(item)}
                        className="secondary-action-button"
                      >
                        <Edit3 className="button-icon" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Click outside to hide search history */}
      {showSearchHistory && (
        <div 
          className="search-history-overlay" 
          onClick={() => setShowSearchHistory(false)}
        />
      )}
    </div>
  );
}

export default StreamList;