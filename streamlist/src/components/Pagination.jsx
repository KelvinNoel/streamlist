// components/Pagination.jsx
import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'

const Pagination = memo(({ currentPage, totalPages, onPageChange, maxVisiblePages = 5 }) => {
  const paginationNumbers = useMemo(() => {
    const pages = []
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }, [currentPage, totalPages, maxVisiblePages])

  const handlePageClick = (page) => {
    onPageChange(page)
  }

  const handleKeyDown = (e, page) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handlePageClick(page)
    }
  }

  if (totalPages <= 1) return null

  return (
    <nav className="pagination" role="navigation" aria-label="Pagination Navigation">
      <button 
        onClick={() => handlePageClick(1)}
        disabled={currentPage === 1}
        className="page-btn"
        title="First page"
        aria-label="Go to first page"
      >
        <i className="fas fa-angle-double-left" aria-hidden="true"></i>
      </button>
      
      <button 
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="page-btn"
        aria-label="Go to previous page"
      >
        <i className="fas fa-chevron-left" aria-hidden="true"></i>
        Previous
      </button>
      
      <div className="page-numbers" role="group" aria-label="Page numbers">
        {paginationNumbers.map(pageNum => (
          <button
            key={pageNum}
            onClick={() => handlePageClick(pageNum)}
            onKeyDown={(e) => handleKeyDown(e, pageNum)}
            className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
            aria-current={currentPage === pageNum ? 'page' : undefined}
            aria-label={`Go to page ${pageNum}`}
          >
            {pageNum}
          </button>
        ))}
      </div>
      
      <button 
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="page-btn"
        aria-label="Go to next page"
      >
        Next
        <i className="fas fa-chevron-right" aria-hidden="true"></i>
      </button>
      
      <button 
        onClick={() => handlePageClick(totalPages)}
        disabled={currentPage === totalPages}
        className="page-btn"
        title="Last page"
        aria-label="Go to last page"
      >
        <i className="fas fa-angle-double-right" aria-hidden="true"></i>
      </button>
      
      <span className="page-info" aria-live="polite">
        Page {currentPage} of {totalPages}
      </span>
    </nav>
  )
})

Pagination.displayName = 'Pagination'

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxVisiblePages: PropTypes.number
}

Pagination.defaultProps = {
  maxVisiblePages: 5
}

export default Pagination