import React from 'react'
import PropTypes from 'prop-types'

const ErrorAlerts = ({ errors, onDismiss }) => {
  return (
    <div className="p-4 flex flex-col gap-2">
      {errors.map((error) => (
        <div key={error} className="alert alert-error shadow-lg flex items-center gap-2">
          <div className="text-sm flex-1">{error}</div>
          <button className="btn btn-sm" onClick={() => onDismiss(error)}>
            Dismiss
          </button>
        </div>
      ))}
    </div>
  )
}

ErrorAlerts.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
  onDismiss: PropTypes.func.isRequired
}

export { ErrorAlerts }
