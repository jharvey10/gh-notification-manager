import clsx from 'clsx'
import PropTypes from 'prop-types'
import { Button } from '../../../../components/Button'
import { compareValues } from '../../../../utils/notifications'

export function ActiveFilterList({ selections, onChange, onClear }) {
  if (selections.length === 0) {
    return null
  }

  const sorted = [...selections].sort((a, b) => compareValues(a.value, b.value))

  return (
    <div className="flex max-w-80 flex-wrap gap-2">
      <span className="text-sm text-base-content/70">{selections.length} selected</span>
      <Button onClick={onClear} className="btn-xs">
        Clear all
      </Button>

      {sorted.map((s) => (
        <button
          key={`${s.state}:${s.value}`}
          type="button"
          className={clsx(
            'btn btn-xs btn-outline justify-start',
            s.state === 'include' ? 'btn-success' : 'btn-error'
          )}
          onClick={() => onChange(s.value, null)}
        >
          {s.state === 'include' ? '+' : '-'}
          {s.value}
        </button>
      ))}
    </div>
  )
}

ActiveFilterList.propTypes = {
  selections: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      state: PropTypes.oneOf(['include', 'exclude']).isRequired
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired
}
