import React, { useState, useEffect } from 'react'
import './Discover.css'

function Discover() {
  // Main movie data and loading state
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedGenre, setSelectedGenre] = useState('')
  const [sortBy, setSortBy] = useState('popularity.desc')
  const [showFavorites, setShowFavorites] = useState(false)
  const [favorites, setFavorites] = useState([])
  
  // Modal-related states for movie details popup
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [movieDetails, setMovieDetails] = useState(null)
  const [movieReviews, setMovieReviews] = useState([])
  const [modalLoading, setModalLoading] = useState(false)

  // TMDB API setup - TODO: move to env variables
  const API_KEY = '43f637ea29ab22f9c3816114799a0c0f'
  const BASE_URL = 'https://api.themoviedb.org/3'
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

  // Genre options for the filter dropdown
  const genres = [
    { id: '', name: 'All Genres' },
    { id: '28', name: 'Action' },
    { id: '35', name: 'Comedy' },
    { id: '18', name: 'Drama' },
    { id: '27', name: 'Horror' },
    { id: '10749', name: 'Romance' },
    { id: '878', name: 'Sci-Fi' },
    { id: '53', name: 'Thriller' }
  ]

  // Helper to get favorites from localStorage
  const loadFavorites = () => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setFavorites(savedFavorites)
    return savedFavorites
  }

  // Quick check if a movie is already favorited
  const isFavorite = (movieId) => {
    return favorites.some(fav => fav.id === movieId)
  }

  // Main function to fetch movies - handles both API calls and favorites display
  const fetchMovies = async (page = 1, search = '', genre = '', sort = 'popularity.desc') => {
    // Special case: show favorites instead of API data
    if (showFavorites) {
      const savedFavorites = loadFavorites()
      setMovies(savedFavorites)
      setTotalPages(1)
      setCurrentPage(1)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      let url = ''
      
      // Build different URLs based on whether we're searching or discovering
      if (search) {
        url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(search)}&page=${page}`
      } else {
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${page}&sort_by=${sort}`
        if (genre) {
          url += `&with_genres=${genre}`
        }
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.results) {
        setMovies(data.results)
        setTotalPages(data.total_pages)
        setCurrentPage(data.page)
        
        // Save search terms for later autocomplete (maybe?)
        if (search && !showFavorites) {
          const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]')
          if (!searchHistory.includes(search)) {
            searchHistory.unshift(search)
            const limitedHistory = searchHistory.slice(0, 10) // Keep only recent searches
            localStorage.setItem('searchHistory', JSON.stringify(limitedHistory))
          }
        }
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
      // TODO: show user-friendly error message
    } finally {
      setLoading(false)
    }
  }

  // Get detailed movie info and reviews for the modal
  const fetchMovieDetails = async (movieId) => {
    setModalLoading(true)
    try {
      // Make both requests simultaneously
      const detailsResponse = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`)
      const details = await detailsResponse.json()
      
      const reviewsResponse = await fetch(`${BASE_URL}/movie/${movieId}/reviews?api_key=${API_KEY}&page=1`)
      const reviewsData = await reviewsResponse.json()
      
      setMovieDetails(details)
      setMovieReviews(reviewsData.results || [])
    } catch (error) {
      console.error('Error fetching movie details:', error)
    } finally {
      setModalLoading(false)
    }
  }

  // Load user's favorites when component first mounts
  useEffect(() => {
    loadFavorites()
  }, [])

  // Refetch movies whenever filters change
  useEffect(() => {
    fetchMovies(1, searchTerm, selectedGenre, sortBy)
  }, [selectedGenre, sortBy, showFavorites])

  // Handle the search form submission
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      setShowFavorites(false) // Exit favorites mode when searching
      fetchMovies(1, searchTerm, selectedGenre, sortBy)
      
      // Track user search behavior for analytics
      const userEvents = JSON.parse(localStorage.getItem('userEvents') || '[]')
      userEvents.push({
        type: 'search',
        query: searchTerm,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('userEvents', JSON.stringify(userEvents))
    }
  }

  // Open movie details modal and track the interaction
  const handleMovieClick = async (movie) => {
    setSelectedMovie(movie)
    setShowModal(true)
    
    // Log movie clicks for recommendation engine later
    const userEvents = JSON.parse(localStorage.getItem('userEvents') || '[]')
    userEvents.push({
      type: 'movie_click',
      movieId: movie.id,
      movieTitle: movie.title,
      timestamp: new Date().toISOString()
    })
    localStorage.setItem('userEvents', JSON.stringify(userEvents))

    // Keep track of recently viewed movies
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    const filteredRecent = recentlyViewed.filter(item => item.id !== movie.id) // Remove if already exists
    filteredRecent.unshift(movie) // Add to beginning
    localStorage.setItem('recentlyViewed', JSON.stringify(filteredRecent.slice(0, 20))) // Keep only 20

    // Start loading detailed info
    await fetchMovieDetails(movie.id)
  }

  // Clean up modal state when closing
  const closeModal = () => {
    setShowModal(false)
    setSelectedMovie(null)
    setMovieDetails(null)
    setMovieReviews([])
  }

  // Add/remove movies from favorites list
  const toggleFavorite = (movie, e) => {
    // Prevent event bubbling when clicking heart icon on movie cards
    if (e) {
      e.stopPropagation()
    }

    const currentFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    const isAlreadyFavorite = currentFavorites.some(fav => fav.id === movie.id)
    
    let updatedFavorites
    let message
    let eventType

    if (isAlreadyFavorite) {
      // Remove from favorites
      updatedFavorites = currentFavorites.filter(fav => fav.id !== movie.id)
      message = `${movie.title} removed from favorites!`
      eventType = 'remove_favorite'
    } else {
      // Add to favorites
      updatedFavorites = [...currentFavorites, movie]
      message = `${movie.title} added to favorites!`
      eventType = 'add_favorite'
    }

    // Update both localStorage and component state
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
    setFavorites(updatedFavorites)
    
    // If we're currently showing favorites view, update the displayed movies
    if (showFavorites) {
      setMovies(updatedFavorites)
    }

    // Track favorite actions
    const userEvents = JSON.parse(localStorage.getItem('userEvents') || '[]')
    userEvents.push({
      type: eventType,
      movieId: movie.id,
      movieTitle: movie.title,
      timestamp: new Date().toISOString()
    })
    localStorage.setItem('userEvents', JSON.stringify(userEvents))
    
    // Simple feedback - could be replaced with toast notification
    alert(message)
  }

  // Switch between all movies and favorites view
  const handleFavoritesToggle = () => {
    setShowFavorites(!showFavorites)
    setSearchTerm('') // Clear search when switching modes
    setCurrentPage(1)
  }

  // Navigate through movie pages
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !showFavorites) {
      fetchMovies(newPage, searchTerm, selectedGenre, sortBy)
      window.scrollTo({ top: 0, behavior: 'smooth' }) // Scroll to top on page change
    }
  }

  // Format review dates to be more readable
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Shorten long review text with ellipsis
  const truncateText = (text, maxLength = 300) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div className="discover">
      <div className="discover-header">
        <h1>Discover Movies</h1>
        <p>Explore thousands of movies with advanced filters</p>
      </div>

      {/* Search bar and filter controls */}
      <div className="controls-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for movies..."
            className="search-input"
            disabled={showFavorites} // Can't search while in favorites mode
          />
          <button type="submit" className="search-btn" disabled={showFavorites}>
            <i className="fas fa-search"></i>
            Search
          </button>
        </form>

        <div className="filters">
          <button
            className={`favorites-toggle ${showFavorites ? 'active' : ''}`}
            onClick={handleFavoritesToggle}
          >
            <i className="fas fa-heart"></i>
            {showFavorites ? `My Favorites (${favorites.length})` : 'Show Favorites'}
          </button>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="filter-select"
            disabled={showFavorites} // Filters don't work in favorites mode
          >
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
            disabled={showFavorites}
          >
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Highest Rated</option>
            <option value="release_date.desc">Newest</option>
            <option value="title.asc">A-Z</option>
          </select>
        </div>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading amazing movies...</p>
        </div>
      )}

      {/* Main movies grid */}
      {!loading && movies.length > 0 && (
        <div className="movies-container">
          <div className="movies-grid">
            {movies.map(movie => (
              <div 
                key={movie.id} 
                className="movie-card"
                onClick={() => handleMovieClick(movie)}
              >
                <div className="movie-poster">
                  {movie.poster_path ? (
                    <img 
                      src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                      alt={movie.title}
                    />
                  ) : (
                    // Fallback for movies without posters
                    <div className="no-poster">
                      <i className="fas fa-film"></i>
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="movie-overlay">
                    <button 
                      className={`favorite-btn ${isFavorite(movie.id) ? 'favorited' : ''}`}
                      onClick={(e) => toggleFavorite(movie, e)}
                      title={isFavorite(movie.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <i className={`fas fa-heart ${isFavorite(movie.id) ? 'filled' : ''}`}></i>
                    </button>
                  </div>
                </div>
                
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <div className="movie-meta">
                    <span className="movie-year">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                    </span>
                    <span className="movie-rating">
                      <i className="fas fa-star"></i>
                      {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <p className="movie-overview">
                    {movie.overview ? 
                      movie.overview.length > 100 ? 
                        movie.overview.substring(0, 100) + '...' : 
                        movie.overview 
                      : 'No description available'
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls - only show for API results, not favorites */}
          {totalPages > 1 && !showFavorites && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-btn"
              >
                <i className="fas fa-chevron-left"></i>
                Previous
              </button>
              
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Next
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state when no movies found */}
      {!loading && movies.length === 0 && (
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
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {modalLoading ? (
              <div className="modal-loading">
                <div className="loading-spinner"></div>
                <p>Loading movie details...</p>
              </div>
            ) : (
              <div className="modal-body">
                {/* Movie info section */}
                <div className="modal-movie-header">
                  <div className="modal-poster">
                    {selectedMovie.poster_path ? (
                      <img 
                        src={`${IMAGE_BASE_URL}${selectedMovie.poster_path}`}
                        alt={selectedMovie.title}
                      />
                    ) : (
                      <div className="no-poster-large">
                        <i className="fas fa-film"></i>
                      </div>
                    )}
                  </div>
                  
                  <div className="modal-movie-info">
                    <h2>{selectedMovie.title}</h2>
                    {movieDetails && (
                      <>
                        <div className="modal-meta">
                          <span className="year">
                            {movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : 'N/A'}
                          </span>
                          <span className="runtime">
                            {movieDetails.runtime ? `${movieDetails.runtime} min` : 'N/A'}
                          </span>
                          <span className="rating">
                            <i className="fas fa-star"></i>
                            {movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                        
                        {/* Show genre tags if available */}
                        {movieDetails.genres && movieDetails.genres.length > 0 && (
                          <div className="genres">
                            {movieDetails.genres.map(genre => (
                              <span key={genre.id} className="genre-tag">
                                {genre.name}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <p className="overview">{movieDetails.overview || selectedMovie.overview}</p>
                        
                        <button 
                          className={`favorite-btn-large ${isFavorite(selectedMovie.id) ? 'favorited' : ''}`}
                          onClick={() => toggleFavorite(selectedMovie)}
                        >
                          <i className={`fas fa-heart ${isFavorite(selectedMovie.id) ? 'filled' : ''}`}></i>
                          {isFavorite(selectedMovie.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* User reviews section */}
                <div className="reviews-section">
                  <h3>Reviews ({movieReviews.length})</h3>
                  
                  {movieReviews.length === 0 ? (
                    <div className="no-reviews">
                      <i className="fas fa-comment-slash"></i>
                      <p>No reviews available for this movie yet.</p>
                    </div>
                  ) : (
                    <div className="reviews-list">
                      {movieReviews.slice(0, 5).map(review => ( // Show only first 5 reviews
                        <div key={review.id} className="review-card">
                          <div className="review-header">
                            <div className="review-author">
                              <strong>{review.author}</strong>
                              {review.author_details?.rating && (
                                <span className="review-rating">
                                  <i className="fas fa-star"></i>
                                  {review.author_details.rating}/10
                                </span>
                              )}
                            </div>
                            <span className="review-date">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                          <div className="review-content">
                            <p>{truncateText(review.content, 400)}</p>
                            {review.content.length > 400 && (
                              <button className="read-more-btn">
                                Read more...
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Discover