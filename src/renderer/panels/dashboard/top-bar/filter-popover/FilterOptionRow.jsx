import PropTypes from 'prop-types'
import { Button } from '../../../../components/Button'

export function FilterOptionRow({ item, count, selectionState, onChange }) {
  const isIncluded = selectionState === 'include'
  const isExcluded = selectionState === 'exclude'

  return (
    <div className="join min-w-40 px-3">
      <Button
        className="join-item"
        outline={!isExcluded}
        aria-pressed={isExcluded}
        aria-label={`${isExcluded ? 'Remove' : 'Exclude'} ${item} filter`}
        onClick={() => onChange(item, isExcluded ? null : 'exclude')}
      >
        -
      </Button>

      <div
        className="join-item flex flex-1 items-center justify-center truncate border border-primary px-4 text-sm text-primary"
        title={item}
      >
        {item}
        <span className="pl-1 opacity-60">({count})</span>
      </div>

      <Button
        className="join-item"
        outline={!isIncluded}
        aria-pressed={isIncluded}
        aria-label={`${isIncluded ? 'Remove' : 'Include'} ${item} filter`}
        onClick={() => onChange(item, isIncluded ? null : 'include')}
      >
        +
      </Button>
    </div>
  )
}

FilterOptionRow.propTypes = {
  item: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  selectionState: PropTypes.oneOf(['include', 'exclude']),
  onChange: PropTypes.func.isRequired
}
