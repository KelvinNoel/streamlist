// hooks/useFavorites.jsx
import { useState, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.jsx'

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([])
  const { getFromStorage, saveToStorage } = useLocalStorage()

  const loadFavorites = useCallback(() => {
    try {
      const savedFavorites = getFromStorage('favorites', [])
      setFavorites(savedFavorites)
      return savedFavorites
    } catch (error) {
      console.error('Error loading favorites:', error)
      setFavorites([])
      return []
    }
  }, [getFromStorage])

  const isFavorite = useCallback((movieId) => {
    return favorites.some(fav => fav.id === movieId)
  }, [favorites])

  const toggleFavorite = useCallback((movie) => {
    try {
      const currentFavorites = getFromStorage('favorites', [])
      const isAlreadyFavorite = currentFavorites.some(fav => fav.id === movie.id)
      
      let updatedFavorites
      
      if (isAlreadyFavorite) {
        updatedFavorites = currentFavorites.filter(fav => fav.id !== movie.id)
      } else {
        updatedFavorites = [...currentFavorites, movie]
      }

      saveToStorage('favorites', updatedFavorites)
      setFavorites(updatedFavorites)
      
      return isAlreadyFavorite // Return true if movie was removed
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw error
    }
  }, [getFromStorage, saveToStorage])

  const addToFavorites = useCallback((movie) => {
    try {
      const currentFavorites = getFromStorage('favorites', [])
      const isAlreadyFavorite = currentFavorites.some(fav => fav.id === movie.id)
      
      if (!isAlreadyFavorite) {
        const updatedFavorites = [...currentFavorites, movie]
        saveToStorage('favorites', updatedFavorites)
        setFavorites(updatedFavorites)
        return true
      }
      return false
    } catch (error) {
      console.error('Error adding to favorites:', error)
      throw error
    }
  }, [getFromStorage, saveToStorage])

  const removeFromFavorites = useCallback((movieId) => {
    try {
      const currentFavorites = getFromStorage('favorites', [])
      const updatedFavorites = currentFavorites.filter(fav => fav.id !== movieId)
      
      if (updatedFavorites.length !== currentFavorites.length) {
        saveToStorage('favorites', updatedFavorites)
        setFavorites(updatedFavorites)
        return true
      }
      return false
    } catch (error) {
      console.error('Error removing from favorites:', error)
      throw error
    }
  }, [getFromStorage, saveToStorage])

  const clearFavorites = useCallback(() => {
    try {
      saveToStorage('favorites', [])
      setFavorites([])
    } catch (error) {
      console.error('Error clearing favorites:', error)
      throw error
    }
  }, [saveToStorage])

  return {
    favorites,
    loadFavorites,
    isFavorite,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    clearFavorites
  }
}