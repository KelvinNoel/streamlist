// hooks/useMovies.jsx
import { useState, useCallback, useRef } from 'react'

export const useMovies = (apiConfig) => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [movieDetails, setMovieDetails] = useState(null)
  const [movieReviews, setMovieReviews] = useState([])
  const [modalLoading, setModalLoading] = useState(false)
  
  // Use ref to track the latest request to prevent race conditions
  const currentRequestRef = useRef(0)

  const fetchMovies = useCallback(async ({ page = 1, search = '', genre = '', sort = 'popularity.desc' }) => {
    if (!apiConfig.API_KEY) return

    setLoading(true)
    const requestId = ++currentRequestRef.current

    try {
      let url = ''
      
      // Build URL based on search or discover
      if (search.trim()) {
        url = `${apiConfig.BASE_URL}/search/movie?api_key=${apiConfig.API_KEY}&query=${encodeURIComponent(search)}&page=${page}`
      } else {
        url = `${apiConfig.BASE_URL}/discover/movie?api_key=${apiConfig.API_KEY}&page=${page}&sort_by=${sort}`
        if (genre) {
          url += `&with_genres=${genre}`
        }
      }

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      // Check if this is still the latest request
      if (requestId !== currentRequestRef.current) {
        return // Ignore outdated response
      }

      if (data.results) {
        setMovies(data.results)
        setTotalPages(Math.min(data.total_pages, 500)) // TMDB API limit
        setCurrentPage(data.page)
      } else {
        setMovies([])
        setTotalPages(1)
      }
    } catch (error) {
      // Only handle error if this is still the current request
      if (requestId === currentRequestRef.current) {
        console.error('Error fetching movies:', error)
        setMovies([])
        setTotalPages(1)
        throw error // Re-throw to handle in component
      }
    } finally {
      // Only set loading false if this is still the current request
      if (requestId === currentRequestRef.current) {
        setLoading(false)
      }
    }
  }, [apiConfig])

  const fetchMovieDetails = useCallback(async (movieId) => {
    if (!apiConfig.API_KEY) return

    setModalLoading(true)
    setMovieDetails(null)
    setMovieReviews([])

    try {
      const [detailsResponse, reviewsResponse] = await Promise.all([
        fetch(`${apiConfig.BASE_URL}/movie/${movieId}?api_key=${apiConfig.API_KEY}`),
        fetch(`${apiConfig.BASE_URL}/movie/${movieId}/reviews?api_key=${apiConfig.API_KEY}&page=1`)
      ])
      
      const results = await Promise.allSettled([
        detailsResponse.ok ? detailsResponse.json() : null,
        reviewsResponse.ok ? reviewsResponse.json() : null
      ])

      if (results[0].status === 'fulfilled' && results[0].value) {
        setMovieDetails(results[0].value)
      }
      
      if (results[1].status === 'fulfilled' && results[1].value) {
        setMovieReviews(results[1].value.results || [])
      }
    } catch (error) {
      console.error('Error fetching movie details:', error)
      throw error
    } finally {
      setModalLoading(false)
    }
  }, [apiConfig])

  const resetMovieDetails = useCallback(() => {
    setMovieDetails(null)
    setMovieReviews([])
  }, [])

  return {
    movies,
    loading,
    currentPage,
    totalPages,
    fetchMovies,
    movieDetails,
    movieReviews,
    modalLoading,
    fetchMovieDetails,
    resetMovieDetails
  }
}