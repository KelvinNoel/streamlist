import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useMovies } from '../hooks/useMovies.jsx'
import { useFavorites } from '../hooks/useFavorites.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.jsx'
import MovieCard from '../components/MovieCard.jsx'
import MovieModal from '../components/MovieModal.jsx'
import SearchFilters from '../components/SearchFilters.jsx'
import Pagination from '../components/Pagination.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import './Discover.css'

// Constants moved to separate file
const API_CONFIG = {
  API_KEY: '43f637ea29ab22f9c3816114799a0c0f',
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500'
}

const GENRES = [
  { id: '', name: 'All Genres' },
  { id: '28', name: 'Action' },
  { id: '35', name: 'Comedy' },
  { id: '18', name: 'Drama' },
  { id: '27', name: 'Horror' },
  { id: '10749', name: 'Romance' },
  { id: '878', name: 'Sci-Fi' },
  { id: '53', name: 'Thriller' }
]

function Discover() {
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [sortBy, setSortBy] = useState('popularity.desc')
  const [showFavorites, setShowFavorites] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState(null)

  // Custom hooks
  const {
    movies,
    loading,
    currentPage,
    totalPages,
    fetchMovies,
    movieDetails,
    movieReviews,
    modalLoading,
    fetchMovieDetails
  } = useMovies(API_CONFIG)

  const {
    favorites,
    isFavorite,
    toggleFavorite,
    loadFavorites
  } = useFavorites()

  const {
    saveToStorage,
    getFromStorage
  } = useLocalStorage()

  // Memoized values
  const displayMovies = useMemo(() => {
    return showFavorites ? favorites : movies
  }, [showFavorites, favorites, movies])

  // Event tracking function
  const trackUserEvent = useCallback((eventType, eventData) => {
    const userEvents = getFromStorage('userEvents', [])
    userEvents.push({
      type: eventType,
      ...eventData,
      timestamp: new Date().toISOString()
    })
    saveToStorage('userEvents', userEvents.slice(-100)) // Keep last 100 events
  }, [getFromStorage, saveToStorage])

  // Load initial data
  useEffect(() => {
    loadFavorites()
    if (!API_CONFIG.API_KEY) {
      setError('API key is missing. Please check your environment variables.')
      return
    }
    fetchMovies({ page: 1, search: '', genre: '', sort: 'popularity.desc' })
  }, [loadFavorites, fetchMovies])

  // Handle filter changes
  useEffect(() => {
    if (!showFavorites && API_CONFIG.API_KEY) {
      fetchMovies({ 
        page: 1, 
        search: searchTerm, 
        genre: selectedGenre, 
        sort: sortBy 
      })
    }
  }, [selectedGenre, sortBy, showFavorites, fetchMovies, searchTerm])

  // Handle search submission
  const handleSearch = useCallback((e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setShowFavorites(false)
    setError(null)
    
    fetchMovies({ 
      page: 1, 
      search: searchTerm, 
      genre: selectedGenre, 
      sort: sortBy 
    })
    
    trackUserEvent('search', { query: searchTerm })
    
    // Save search history
    const searchHistory = getFromStorage('searchHistory', [])
    if (!searchHistory.includes(searchTerm)) {
      searchHistory.unshift(searchTerm)
      saveToStorage('searchHistory', searchHistory.slice(0, 10))
    }
  }, [searchTerm, selectedGenre, sortBy, fetchMovies, trackUserEvent, getFromStorage, saveToStorage])

  // Handle movie card click
  const handleMovieClick = useCallback(async (movie) => {
    try {
      setSelectedMovie(movie)
      setShowModal(true)
      
      // Track movie click
      trackUserEvent('movie_click', {
        movieId: movie.id,
        movieTitle: movie.title
      })

      // Update recently viewed
      const recentlyViewed = getFromStorage('recentlyViewed', [])
      const filteredRecent = recentlyViewed.filter(item => item.id !== movie.id)
      filteredRecent.unshift(movie)
      saveToStorage('recentlyViewed', filteredRecent.slice(0, 20))

      // Fetch movie details
      await fetchMovieDetails(movie.id)
    } catch (error) {
      console.error('Error handling movie click:', error)
      setError('Failed to load movie details. Please try again.')
    }
  }, [trackUserEvent, getFromStorage, saveToStorage, fetchMovieDetails])

  // Close modal
  const closeModal = useCallback(() => {
    setShowModal(false)
    setSelectedMovie(null)
  }, [])

  // Handle favorite toggle with optimistic updates
  const handleFavoriteToggle = useCallback((movie, e) => {
    if (e) {
      e.stopPropagation()
    }

    try {
      const wasRemoved = toggleFavorite(movie)
      const eventType = wasRemoved ? 'remove_favorite' : 'add_favorite'
      const message = wasRemoved 
        ? `${movie.title} removed from favorites!` 
        : `${movie.title} added to favorites!`

      trackUserEvent(eventType, {
        movieId: movie.id,
        movieTitle: movie.title
      })
      
      // Show user feedback (consider replacing alert with toast notification)
      alert(message)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      setError('Failed to update favorites. Please try again.')
    }
  }, [toggleFavorite, trackUserEvent])

  // Toggle favorites view
  const handleFavoritesToggle = useCallback(() => {
    setShowFavorites(prev => !prev)
    setSearchTerm('')
    setError(null)
  }, [])

  // Handle pagination
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !showFavorites) {
      fetchMovies({ 
        page: newPage, 
        search: searchTerm, 
        genre: selectedGenre, 
        sort: sortBy 
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [totalPages, showFavorites, fetchMovies, searchTerm, selectedGenre, sortBy])

  // Handle filter changes
  const handleGenreChange = useCallback((genre) => {
    setSelectedGenre(genre)
    setError(null)
  }, [])

  const handleSortChange = useCallback((sort) => {
    setSortBy(sort)
    setError(null)
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  if (!API_CONFIG.API_KEY) {
    return (
      <div className="discover">
        <ErrorMessage 
          message="API configuration error. Please check your environment variables."
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="discover">
      <div className="discover-header">
        <h1>Discover Movies</h1>
        <p>Explore thousands of movies with advanced filters</p>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage 
          message={error} 
          onClose={clearError}
        />
      )}

      {/* Search and filter controls */}
      <SearchFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSubmit={handleSearch}
        selectedGenre={selectedGenre}
        onGenreChange={handleGenreChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        showFavorites={showFavorites}
        onFavoritesToggle={handleFavoritesToggle}
        favoritesCount={favorites.length}
        genres={GENRES}
        disabled={showFavorites}
      />

      {/* Loading spinner */}
      {loading && <LoadingSpinner message="Loading amazing movies..." />}

      {/* Movies grid */}
      {!loading && displayMovies.length > 0 && (
        <div className="movies-container">
          <div className="movies-grid">
            {displayMovies.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={handleMovieClick}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorite={isFavorite(movie.id)}
                imageBaseUrl={API_CONFIG.IMAGE_BASE_URL}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && !showFavorites && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && displayMovies.length === 0 && (
        <div className="no-results">
          <i className="fas fa-search"></i>
          <h3>{showFavorites ? 'No favorite movies yet' : 'No movies found'}</h3>
          <p>
            {showFavorites 
              ? 'Start adding movies to your favorites to see them here!' 
              : 'Try adjusting your search or filters'
            }
          </p>
        </div>
      )}

      {/* Movie details modal */}
      {showModal && selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          movieDetails={movieDetails}
          movieReviews={movieReviews}
          loading={modalLoading}
          isFavorite={isFavorite(selectedMovie.id)}
          onClose={closeModal}
          onFavoriteToggle={() => handleFavoriteToggle(selectedMovie)}
          imageBaseUrl={API_CONFIG.IMAGE_BASE_URL}
        />
      )}
    </div>
  )
}

export default Discover