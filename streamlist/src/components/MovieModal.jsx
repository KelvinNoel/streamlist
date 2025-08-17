// components/MovieModal.jsx
import React, { memo, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import LoadingSpinner from './LoadingSpinner.jsx'

const MovieModal = memo(({
  movie,
  movieDetails,
  movieReviews,
  loading,
  isFavorite,
  onClose,
  onFavoriteToggle,
  imageBaseUrl
}) => {
  // Handle escape key to close modal
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  // Add event listener for escape key
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [handleKeyDown])

  // Focus management
  useEffect(() => {
    const modalElement = document.querySelector('.modal-content')
    if (modalElement) {
      modalElement.focus()
    }
  }, [])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const truncateText = (text, maxLength = 400) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : 'N/A'
  }

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="modal-header">
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label="Close movie details"
            title="Close (Esc)"
          >
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>

        {loading ? (
          <div className="modal-loading">
            <LoadingSpinner message="Loading movie details..." size="large" />
          </div>
        ) : (
          <div className="modal-body">
            <div className="modal-movie-header">
              <div className="modal-poster">
                {movie.poster_path ? (
                  <img 
                    src={`${imageBaseUrl}${movie.poster_path}`}
                    alt={`${movie.title} poster`}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : (
                  <div className="no-poster-large">
                    <i className="fas fa-film" aria-hidden="true"></i>
                  </div>
                )}
                
                {/* Fallback for broken images */}
                <div 
                  className="no-poster-large" 
                  style={{ display: 'none' }}
                  aria-hidden="true"
                >
                  <i className="fas fa-film"></i>
                </div>
              </div>
              
              <div className="modal-movie-info">
                <h2 id="modal-title">{movie.title}</h2>
                
                {movieDetails && (
                  <>
                    <div className="modal-meta">
                      <span className="year">
                        {movieDetails.release_date ? 
                          new Date(movieDetails.release_date).getFullYear() : 'N/A'
                        }
                      </span>
                      <span className="runtime">
                        {formatRuntime(movieDetails.runtime)}
                      </span>
                      <span className="rating">
                        <i className="fas fa-star" aria-hidden="true"></i>
                        {formatRating(movieDetails.vote_average)}
                        <span className="sr-only">out of 10</span>
                      </span>
                      {movieDetails.vote_count && (
                        <span className="vote-count">
                          ({movieDetails.vote_count.toLocaleString()} votes)
                        </span>
                      )}
                    </div>
                    
                    {movieDetails.genres && movieDetails.genres.length > 0 && (
                      <div className="genres" role="list" aria-label="Movie genres">
                        {movieDetails.genres.map(genre => (
                          <span 
                            key={genre.id} 
                            className="genre-tag"
                            role="listitem"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {movieDetails.tagline && (
                      <p className="tagline" style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
                        "{movieDetails.tagline}"
                      </p>
                    )}
                    
                    <div className="overview-section">
                      <h3>Overview</h3>
                      <p className="overview">
                        {movieDetails.overview || movie.overview || 'No overview available.'}
                      </p>
                    </div>
                    
                    {movieDetails.budget > 0 && (
                      <div className="additional-info">
                        <h4>Production Details</h4>
                        <div className="info-grid">
                          {movieDetails.budget > 0 && (
                            <div className="info-item">
                              <strong>Budget:</strong> ${movieDetails.budget.toLocaleString()}
                            </div>
                          )}
                          {movieDetails.revenue > 0 && (
                            <div className="info-item">
                              <strong>Revenue:</strong> ${movieDetails.revenue.toLocaleString()}
                            </div>
                          )}
                          {movieDetails.production_companies && movieDetails.production_companies.length > 0 && (
                            <div className="info-item">
                              <strong>Production:</strong> {movieDetails.production_companies[0].name}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <button 
                      className={`favorite-btn-large ${isFavorite ? 'favorited' : ''}`}
                      onClick={onFavoriteToggle}
                      aria-label={isFavorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
                    >
                      <i 
                        className={`fas fa-heart ${isFavorite ? 'filled' : ''}`} 
                        aria-hidden="true"
                      ></i>
                      {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Reviews section */}
            <div className="reviews-section">
              <h3>Reviews ({movieReviews.length})</h3>
              
              {movieReviews.length === 0 ? (
                <div className="no-reviews">
                  <i className="fas fa-comment-slash" aria-hidden="true"></i>
                  <p>No reviews available for this movie yet.</p>
                </div>
              ) : (
                <div className="reviews-list" role="list" aria-label="Movie reviews">
                  {movieReviews.slice(0, 5).map(review => (
                    <article key={review.id} className="review-card" role="listitem">
                      <div className="review-header">
                        <div className="review-author">
                          <strong>{review.author}</strong>
                          {review.author_details?.rating && (
                            <span className="review-rating">
                              <i className="fas fa-star" aria-hidden="true"></i>
                              {review.author_details.rating}/10
                            </span>
                          )}
                        </div>
                        <time className="review-date" dateTime={review.created_at}>
                          {formatDate(review.created_at)}
                        </time>
                      </div>
                      <div className="review-content">
                        <p>{truncateText(review.content, 400)}</p>
                        {review.content && review.content.length > 400 && (
                          <button 
                            className="read-more-btn"
                            onClick={() => {
                              // Could implement expand functionality
                              console.log('Expand review:', review.id)
                            }}
                          >
                            Read more...
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                  
                  {movieReviews.length > 5 && (
                    <div className="more-reviews">
                      <p>And {movieReviews.length - 5} more reviews...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

MovieModal.displayName = 'MovieModal'

MovieModal.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    poster_path: PropTypes.string,
    overview: PropTypes.string
  }).isRequired,
  movieDetails: PropTypes.object,
  movieReviews: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  isFavorite: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onFavoriteToggle: PropTypes.func.isRequired,
  imageBaseUrl: PropTypes.string.isRequired
}

MovieModal.defaultProps = {
  movieDetails: null,
  movieReviews: []
}

export default MovieModal