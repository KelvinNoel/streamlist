// components/ErrorMessage.jsx
import React, { memo } from 'react'
import PropTypes from 'prop-types'

const ErrorMessage = memo(({ 
  message, 
  onClose, 
  onRetry, 
  type = 'error',
  dismissible = true,
  retryable = false,
  className = '' 
}) => {
  const typeClasses = {
    error: 'error-message error',
    warning: 'error-message warning',
    info: 'error-message info'
  }

  const icons = {
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }

  return (
    <div 
      className={`${typeClasses[type]} ${className}`} 
      role="alert" 
      aria-live="assertive"
    >
      <div className="error-content">
        <i className={icons[type]} aria-hidden="true"></i>
        <span className="error-text">{message}</span>
      </div>
      
      <div className="error-actions">
        {retryable && onRetry && (
          <button 
            className="error-btn retry-btn" 
            onClick={onRetry}
            aria-label="Retry the failed action"
          >
            <i className="fas fa-redo" aria-hidden="true"></i>
            Retry
          </button>
        )}
        
        {dismissible && onClose && (
          <button 
            className="error-btn close-btn" 
            onClick={onClose}
            aria-label="Dismiss this error message"
          >
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        )}
      </div>
    </div>
  )
})

ErrorMessage.displayName = 'ErrorMessage'

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onRetry: PropTypes.func,
  type: PropTypes.oneOf(['error', 'warning', 'info']),
  dismissible: PropTypes.bool,
  retryable: PropTypes.bool,
  className: PropTypes.string
}

ErrorMessage.defaultProps = {
  type: 'error',
  dismissible: true,
  retryable: false,
  className: ''
}

export default ErrorMessage