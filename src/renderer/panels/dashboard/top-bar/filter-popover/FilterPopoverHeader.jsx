import PropTypes from 'prop-types'

export function FilterPopoverHeader({ title, description }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 text-center">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-base-content/70">{description}</p>
      </div>
    </div>
  )
}

FilterPopoverHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
}
