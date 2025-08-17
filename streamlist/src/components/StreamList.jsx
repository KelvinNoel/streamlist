import React, { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
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

// Custom hooks for better separation of concerns
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key]);

  return [storedValue, setValue];
};

// Reducer for managing complex stream items state
const streamItemsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ITEMS':
      return action.payload;
    case 'ADD_ITEM':
      return [...state, action.payload];
    case 'DELETE_ITEM':
      return state.filter(item => item.id !== action.payload);
    case 'UPDATE_ITEM':
      return state.map(item => 
        item.id === action.payload.id 
          ? { ...item, ...action.payload.updates }
          : item
      );
    case 'TOGGLE_COMPLETE':
      return state.map(item =>
        item.id === action.payload
          ? { ...item, completed: !item.completed }
          : item
      );
    case 'TOGGLE_FAVORITE':
      return state.map(item =>
        item.id === action.payload
          ? { ...item, favorite: !item.favorite }
          : item
      );
    default:
      return state;
  }
};

// Statistics Dashboard Component
const StatsSection = React.memo(({ stats }) => {
  const statsData = [
    { icon: <Film className="stat-icon" />, label: 'Total Items', value: stats.total, colorClass: 'stat-icon-blue' },
    { icon: <Check className="stat-icon" />, label: 'Completed', value: stats.completed, colorClass: 'stat-icon-green' },
    { icon: <Flame className="stat-icon" />, label: 'High Priority', value: stats.highPriority, colorClass: 'stat-icon-red' },
    { icon: <Heart className="stat-icon" />, label: 'Favorites', value: stats.favorites, colorClass: 'stat-icon-pink' }
  ];

  return (
    <div className="stats-grid">
      {statsData.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className={`stat-icon-container ${stat.colorClass}`}>
            {stat.icon}
          </div>
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
});

// Form Component for adding new items
const StreamItemForm = React.memo(({ onSubmit, storeUserEvent }) => {
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    priority: 'medium',
    notes: '',
    rating: 0
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    const newItem = {
      id: Date.now(),
      ...formData,
      rating: parseInt(formData.rating) || 0,
      dateAdded: new Date().toLocaleDateString(),
      completed: false,
      favorite: false,
      createdAt: new Date().toISOString()
    };
    
    onSubmit(newItem);
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
  }, [formData, onSubmit, storeUserEvent]);

  return (
    <div className="form-section">
      <div className="form-header">
        <Plus className="form-header-icon" />
        <h2 className="form-title">Add New Title</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
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
              required
              aria-label="Title"
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
              aria-label="Genre"
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
              aria-label="Priority"
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
              aria-label="Rating"
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
              aria-label="Notes"
            />
          </div>
        </div>

        <button type="submit" className="submit-button">
          <Plus className="submit-button-icon" />
          Add to Stream List
        </button>
      </form>
    </div>
  );
});

// Search and Filter Controls Component
const SearchFilters = React.memo(({ 
  searchTerm, 
  onSearchChange, 
  searchHistory, 
  showSearchHistory, 
  setShowSearchHistory,
  onSearchFromHistory,
  filterGenre, 
  filterPriority, 
  sortBy, 
  showCompleted, 
  onFilterChange,
  onToggleCompleted 
}) => {
  return (
    <div className="controls-section">
      <div className="controls-container">
        <div className="controls-group">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search titles..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setShowSearchHistory(true)}
              className="search-input"
              aria-label="Search titles"
            />
            
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
                    onClick={() => onSearchFromHistory(term)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onSearchFromHistory(term);
                      }
                    }}
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
            onChange={(e) => onFilterChange('genre', e.target.value)}
            className="filter-select"
            aria-label="Filter by genre"
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
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="filter-select"
            aria-label="Filter by priority"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className="filter-select"
            aria-label="Sort by"
          >
            <option value="dateAdded">Date Added</option>
            <option value="title">Title</option>
            <option value="priority">Priority</option>
            <option value="rating">Rating</option>
            <option value="genre">Genre</option>
          </select>
        </div>

        <button
          onClick={onToggleCompleted}
          className={`toggle-button ${showCompleted ? 'toggle-button-active' : 'toggle-button-inactive'}`}
          aria-label={showCompleted ? 'Hide completed items' : 'Show completed items'}
        >
          {showCompleted ? <Eye className="toggle-icon" /> : <EyeOff className="toggle-icon" />}
          {showCompleted ? 'Hide Completed' : 'Show Completed'}
        </button>
      </div>
    </div>
  );
});

// Individual Stream Item Card Component
const StreamItemCard = React.memo(({ 
  item, 
  index, 
  isEditing, 
  editFormData, 
  onEditInputChange, 
  onToggleComplete, 
  onToggleFavorite, 
  onDelete, 
  onStartEdit, 
  onSaveEdit, 
  onCancelEdit,
  getPriorityIcon,
  getGenreIcon 
}) => {
  const handleToggleComplete = useCallback(() => {
    onToggleComplete(item.id);
  }, [item.id, onToggleComplete]);

  const handleToggleFavorite = useCallback(() => {
    onToggleFavorite(item.id);
  }, [item.id, onToggleFavorite]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      onDelete(item.id);
    }
  }, [item.id, item.title, onDelete]);

  const handleStartEdit = useCallback(() => {
    onStartEdit(item);
  }, [item, onStartEdit]);

  const handleSaveEdit = useCallback(() => {
    onSaveEdit(item.id);
  }, [item.id, onSaveEdit]);

  if (isEditing) {
    return (
      <div className={`item-card ${item.completed ? 'item-card-completed' : ''}`}>
        <div className="edit-form">
          <input
            type="text"
            name="title"
            value={editFormData.title}
            onChange={onEditInputChange}
            className="edit-input"
            aria-label="Edit title"
          />
          
          <div className="edit-grid">
            <select
              name="genre"
              value={editFormData.genre}
              onChange={onEditInputChange}
              className="edit-input"
              aria-label="Edit genre"
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
              onChange={onEditInputChange}
              className="edit-input"
              aria-label="Edit priority"
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
            onChange={onEditInputChange}
            placeholder="Rating (0-10)"
            className="edit-input"
            aria-label="Edit rating"
          />
          
          <textarea
            name="notes"
            value={editFormData.notes}
            onChange={onEditInputChange}
            placeholder="Notes..."
            rows="2"
            className="edit-textarea"
            aria-label="Edit notes"
          />
          
          <div className="edit-actions">
            <button
              onClick={handleSaveEdit}
              className="edit-save-button"
              aria-label="Save changes"
            >
              <Check className="edit-button-icon" />
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className="edit-cancel-button"
              aria-label="Cancel editing"
            >
              <X className="edit-button-icon" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`item-card ${item.completed ? 'item-card-completed' : ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
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
            onClick={handleToggleFavorite}
            className={`action-button favorite-button ${item.favorite ? 'favorite-button-active' : ''}`}
            aria-label={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart 
              className="action-icon" 
              fill={item.favorite ? 'currentColor' : 'none'}
            />
          </button>
          
          <button
            onClick={handleDelete}
            className="action-button delete-button"
            aria-label="Delete item"
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
          onClick={handleToggleComplete}
          className={`primary-action-button ${item.completed ? 'completed-button' : 'incomplete-button'}`}
          aria-label={item.completed ? 'Mark as not watched' : 'Mark as watched'}
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
          onClick={handleStartEdit}
          className="secondary-action-button"
          aria-label="Edit item"
        >
          <Edit3 className="button-icon" />
        </button>
      </div>
    </div>
  );
});

// Main StreamList Component
function StreamList() {
  // Use reducer for complex state management
  const [streamItems, dispatch] = useReducer(streamItemsReducer, []);
  
  // Separate state for UI concerns
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [showCompleted, setShowCompleted] = useState(true);
  
  // Search functionality
  const [searchHistory, setSearchHistory] = useLocalStorage('streamList_searchHistory', []);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  
  const [editFormData, setEditFormData] = useState({
    title: '',
    genre: '',
    priority: 'medium',
    notes: '',
    rating: 0
  });

  // Storage keys
  const STORAGE_KEYS = useMemo(() => ({
    STREAM_ITEMS: 'streamList_items',
    USER_EVENTS: 'streamList_userEvents',
    SEARCH_HISTORY: 'streamList_searchHistory',
    FILTERS: 'streamList_filters',
    RECENTLY_VIEWED: 'streamList_recentlyViewed',
    USER_PREFERENCES: 'streamList_preferences'
  }), []);

  // Load data on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Auto-save items
  useEffect(() => {
    if (streamItems.length > 0) {
      localStorage.setItem(STORAGE_KEYS.STREAM_ITEMS, JSON.stringify(streamItems));
    }
  }, [streamItems, STORAGE_KEYS.STREAM_ITEMS]);

  // Persist filter settings
  useEffect(() => {
    const filters = {
      searchTerm,
      filterGenre,
      filterPriority,
      sortBy,
      showCompleted
    };
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
  }, [searchTerm, filterGenre, filterPriority, sortBy, showCompleted, STORAGE_KEYS.FILTERS]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedItems = localStorage.getItem(STORAGE_KEYS.STREAM_ITEMS);
      if (savedItems) {
        dispatch({ type: 'SET_ITEMS', payload: JSON.parse(savedItems) });
      }

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
  }, [STORAGE_KEYS]);

  const storeUserEvent = useCallback((eventType, eventData = {}) => {
    try {
      const userEvents = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_EVENTS) || '[]');
      const newEvent = {
        id: Date.now(),
        type: eventType,
        timestamp: new Date().toISOString(),
        data: eventData
      };
      
      userEvents.unshift(newEvent);
      const limitedEvents = userEvents.slice(0, 100);
      localStorage.setItem(STORAGE_KEYS.USER_EVENTS, JSON.stringify(limitedEvents));
    } catch (error) {
      console.error('Error storing user event:', error);
    }
  }, [STORAGE_KEYS.USER_EVENTS]);

  const updateSearchHistory = useCallback((term) => {
    if (term.trim() && !searchHistory.includes(term)) {
      const newHistory = [term, ...searchHistory].slice(0, 10);
      setSearchHistory(newHistory);
      storeUserEvent('search', { searchTerm: term });
    }
  }, [searchHistory, setSearchHistory, storeUserEvent]);

  // Memoized handlers
  const handleAddItem = useCallback((newItem) => {
    dispatch({ type: 'ADD_ITEM', payload: newItem });
  }, []);

  const handleDeleteItem = useCallback((id) => {
    const item = streamItems.find(item => item.id === id);
    dispatch({ type: 'DELETE_ITEM', payload: id });
    storeUserEvent('item_deleted', { itemId: id, title: item?.title });
  }, [streamItems, storeUserEvent]);

  const handleToggleComplete = useCallback((id) => {
    const item = streamItems.find(item => item.id === id);
    dispatch({ type: 'TOGGLE_COMPLETE', payload: id });
    
    const newCompletedState = !item.completed;
    storeUserEvent(
      newCompletedState ? 'item_completed' : 'item_uncompleted', 
      { itemId: id, title: item?.title }
    );
  }, [streamItems, storeUserEvent]);

  const handleToggleFavorite = useCallback((id) => {
    const item = streamItems.find(item => item.id === id);
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id });
    
    const newFavoriteState = !item.favorite;
    storeUserEvent(
      newFavoriteState ? 'item_favorited' : 'item_unfavorited',
      { itemId: id, title: item?.title }
    );
  }, [streamItems, storeUserEvent]);

  const handleStartEdit = useCallback((item) => {
    setEditingId(item.id);
    setEditFormData({
      title: item.title,
      genre: item.genre,
      priority: item.priority,
      notes: item.notes,
      rating: item.rating
    });
    storeUserEvent('item_edit_started', { itemId: item.id, title: item.title });
  }, [storeUserEvent]);

  const handleSaveEdit = useCallback((id) => {
    const item = streamItems.find(item => item.id === id);
    dispatch({ 
      type: 'UPDATE_ITEM', 
      payload: { 
        id, 
        updates: { 
          ...editFormData, 
          rating: parseInt(editFormData.rating) || 0 
        } 
      } 
    });
    
    storeUserEvent('item_edited', {
      itemId: id,
      title: item?.title,
      changes: editFormData
    });
    
    setEditingId(null);
  }, [streamItems, editFormData, storeUserEvent]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditFormData({
      title: '',
      genre: '',
      priority: 'medium',
      notes: '',
      rating: 0
    });
    storeUserEvent('item_edit_cancelled', {});
  }, [storeUserEvent]);

  const handleEditInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    if (value.trim()) {
      updateSearchHistory(value);
    }
  }, [updateSearchHistory]);

  const handleSearchFromHistory = useCallback((term) => {
    setSearchTerm(term);
    setShowSearchHistory(false);
    storeUserEvent('search_from_history', { searchTerm: term });
  }, [storeUserEvent]);

  const handleFilterChange = useCallback((filterType, value) => {
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
  }, [storeUserEvent]);

  const handleToggleCompleted = useCallback(() => {
    setShowCompleted(prev => !prev);
  }, []);

  // Memoized utility functions
  const getPriorityIcon = useCallback((priority) => {
    switch(priority) {
      case 'high': return <Flame className="priority-icon" />;
      case 'medium': return <Zap className="priority-icon" />;
      case 'low': return <Clock className="priority-icon" />;
      default: return <Film className="priority-icon" />;
    }
  }, []);

  const getGenreIcon = useCallback((genre) => {
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
  }, []);

  const exportData = useCallback(() => {
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
  }, [streamItems, searchHistory, STORAGE_KEYS.USER_EVENTS, storeUserEvent]);

  // Memoized filtered and sorted items
  const filteredAndSortedItems = useMemo(() => {
    return streamItems
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
  }, [streamItems, searchTerm, filterGenre, filterPriority, sortBy, showCompleted]);

  // Memoized statistics
  const stats = useMemo(() => ({
    total: streamItems.length,
    completed: streamItems.filter(item => item.completed).length,
    highPriority: streamItems.filter(item => item.priority === 'high').length,
    favorites: streamItems.filter(item => item.favorite).length
  }), [streamItems]);

  return (
    <div className="streamlist-container">
      {/* Hero section with branding and key metrics */}
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
          
          <StatsSection stats={stats} />

          <div className="data-management">
            <button onClick={exportData} className="export-button">
              <Save className="export-icon" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        <StreamItemForm onSubmit={handleAddItem} storeUserEvent={storeUserEvent} />

        <SearchFilters 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          searchHistory={searchHistory}
          showSearchHistory={showSearchHistory}
          setShowSearchHistory={setShowSearchHistory}
          onSearchFromHistory={handleSearchFromHistory}
          filterGenre={filterGenre}
          filterPriority={filterPriority}
          sortBy={sortBy}
          showCompleted={showCompleted}
          onFilterChange={handleFilterChange}
          onToggleCompleted={handleToggleCompleted}
        />

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
              <StreamItemCard
                key={item.id}
                item={item}
                index={index}
                isEditing={editingId === item.id}
                editFormData={editFormData}
                onEditInputChange={handleEditInputChange}
                onToggleComplete={handleToggleComplete}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteItem}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                getPriorityIcon={getPriorityIcon}
                getGenreIcon={getGenreIcon}
              />
            ))}
          </div>
        )}
      </div>
      
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