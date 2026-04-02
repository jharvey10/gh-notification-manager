import PropTypes from 'prop-types'
import { Button } from '../../../../components/Button'

export function FilterPopoverTrigger({ triggerLabel, activeItemCount, ...buttonProps }) {
  return (
    <Button {...buttonProps}>
      {activeItemCount > 0 ? `${triggerLabel} (${activeItemCount})` : triggerLabel}
    </Button>
  )
}

FilterPopoverTrigger.propTypes = {
  triggerLabel: PropTypes.string.isRequired,
  activeItemCount: PropTypes.number.isRequired
}
