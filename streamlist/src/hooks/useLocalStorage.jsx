// hooks/useLocalStorage.jsx
import { useCallback } from 'react'

export const useLocalStorage = () => {
  const getFromStorage = useCallback((key, defaultValue = []) => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }
      return JSON.parse(item)
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return defaultValue
    }
  }, [])

  const saveToStorage = useCallback((key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
      // Handle storage quota exceeded
      if (error.name === 'QuotaExceededError') {
        // Try to clear some old data
        try {
          localStorage.removeItem('userEvents')
          localStorage.setItem(key, JSON.stringify(value))
        } catch (retryError) {
          console.error('Failed to save after clearing storage:', retryError)
        }
      }
      throw error
    }
  }, [])

  const removeFromStorage = useCallback((key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
    }
  }, [])

  const clearStorage = useCallback(() => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }, [])

  const storageAvailable = useCallback(() => {
    try {
      const testKey = '__localStorage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }, [])

  return {
    getFromStorage,
    saveToStorage,
    removeFromStorage,
    clearStorage,
    storageAvailable
  }
}