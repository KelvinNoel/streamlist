// components/SearchFilters.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'

const SearchFilters = memo(({
  searchTerm,
  onSearchTermChange,
  onSubmit,
  selectedGenre,
  onGenreChange,
  sortBy,
  onSortChange,
  showFavorites,
  onFavoritesToggle,
  favoritesCount,
  genres,
  disabled
}) => {
  const handleSearchChange = (e) => {
    onSearchTermChange(e.target.value)
  }

  const handleGenreChange = (e) => {
    onGenreChange(e.target.value)
  }

  const handleSortChange = (e) => {
    onSortChange(e.target.value)
  }

  return (
    <div className="controls-section">
      <form onSubmit={onSubmit} className="search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search for movies..."
          className="search-input"
          disabled={disabled}
          aria-label="Search for movies"
        />
        <button 
          type="submit" 
          className="search-btn" 
          disabled={disabled || !searchTerm.trim()}
          aria-label="Search movies"
        >
          <i className="fas fa-search" aria-hidden="true"></i>
          Search
        </button>
      </form>

      <div className="filters">
        <button
          className={`favorites-toggle ${showFavorites ? 'active' : ''}`}
          onClick={onFavoritesToggle}
          aria-label={showFavorites ? 'Show all movies' : 'Show favorite movies'}
        >
          <i className="fas fa-heart" aria-hidden="true"></i>
          {showFavorites ? `My Favorites (${favoritesCount})` : 'Show Favorites'}
        </button>

        <select
          value={selectedGenre}
          onChange={handleGenreChange}
          className="filter-select"
          disabled={disabled}
          aria-label="Filter by genre"
        >
          {genres.map(genre => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={handleSortChange}
          className="filter-select"
          disabled={disabled}
          aria-label="Sort movies by"
        >
          <option value="popularity.desc">Most Popular</option>
          <option value="vote_average.desc">Highest Rated</option>
          <option value="release_date.desc">Newest</option>
          <option value="title.asc">A-Z</option>
        </select>
      </div>
    </div>
  )
})

SearchFilters.displayName = 'SearchFilters'

SearchFilters.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchTermChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  selectedGenre: PropTypes.string.isRequired,
  onGenreChange: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  showFavorites: PropTypes.bool.isRequired,
  onFavoritesToggle: PropTypes.func.isRequired,
  favoritesCount: PropTypes.number.isRequired,
  genres: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  disabled: PropTypes.bool
}

SearchFilters.defaultProps = {
  disabled: false
}

export default SearchFilters