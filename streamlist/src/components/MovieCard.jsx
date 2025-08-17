// components/MovieCard.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'

const MovieCard = memo(({ 
  movie, 
  onClick, 
  onFavoriteToggle, 
  isFavorite, 
  imageBaseUrl 
}) => {
  const handleClick = () => {
    onClick(movie)
  }

  const handleFavoriteClick = (e) => {
    onFavoriteToggle(movie, e)
  }

  const getMovieYear = (releaseDate) => {
    return releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'
  }

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : 'N/A'
  }

  const truncateOverview = (overview, maxLength = 100) => {
    if (!overview) return 'No description available'
    return overview.length > maxLength 
      ? overview.substring(0, maxLength) + '...' 
      : overview
  }

  return (
    <div 
      className="movie-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={`View details for ${movie.title}`}
    >
      <div className="movie-poster">
        {movie.poster_path ? (
          <img 
            src={`${imageBaseUrl}${movie.poster_path}`}
            alt={`${movie.title} poster`}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : (
          <div className="no-poster">
            <i className="fas fa-film" aria-hidden="true"></i>
            <span>No Image</span>
          </div>
        )}
        
        <div className="movie-overlay">
          <button 
            className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
            onClick={handleFavoriteClick}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
          >
            <i 
              className={`fas fa-heart ${isFavorite ? 'filled' : ''}`} 
              aria-hidden="true"
            />
          </button>
        </div>
        
        {/* Hidden fallback for broken images */}
        <div 
          className="no-poster" 
          style={{ display: 'none' }}
          aria-hidden="true"
        >
          <i className="fas fa-film"></i>
          <span>No Image</span>
        </div>
      </div>
      
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="movie-year">
            {getMovieYear(movie.release_date)}
          </span>
          <span className="movie-rating">
            <i className="fas fa-star" aria-hidden="true"></i>
            {formatRating(movie.vote_average)}
          </span>
        </div>
        <p className="movie-overview">
          {truncateOverview(movie.overview)}
        </p>
      </div>
    </div>
  )
})

MovieCard.displayName = 'MovieCard'

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    poster_path: PropTypes.string,
    release_date: PropTypes.string,
    vote_average: PropTypes.number,
    overview: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onFavoriteToggle: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool.isRequired,
  imageBaseUrl: PropTypes.string.isRequired
}

export default MovieCard