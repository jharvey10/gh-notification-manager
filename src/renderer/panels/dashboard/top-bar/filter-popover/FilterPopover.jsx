import PropTypes from 'prop-types'
import { PopoverCard } from '../PopoverCard'
import { ActiveFilterList } from './ActiveFilterList'
import { FilterOptionRow } from './FilterOptionRow'
import { FilterPopoverHeader } from './FilterPopoverHeader'
import { FilterPopoverTrigger } from './FilterPopoverTrigger'

export function FilterPopover({
  popoverId,
  anchorName,
  triggerLabel,
  title,
  description,
  items,
  itemCounts,
  selections,
  onChange,
  onClear
}) {
  return (
    <PopoverCard
      popoverId={popoverId}
      anchorName={anchorName}
      trigger={
        <FilterPopoverTrigger triggerLabel={triggerLabel} activeItemCount={selections.length} />
      }
    >
      <div className="flex min-w-80 max-w-96 flex-col gap-3">
        <FilterPopoverHeader title={title} description={description} />
        <ActiveFilterList selections={selections} onChange={onChange} onClear={onClear} />
        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto -mx-3">
          {items.map((item) => (
            <FilterOptionRow
              key={item}
              item={item}
              count={itemCounts.get(item) ?? 0}
              selectionState={selections.find((s) => s.value === item)?.state ?? null}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    </PopoverCard>
  )
}

FilterPopover.propTypes = {
  popoverId: PropTypes.string.isRequired,
  anchorName: PropTypes.string.isRequired,
  triggerLabel: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  itemCounts: PropTypes.instanceOf(Map).isRequired,
  selections: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      state: PropTypes.oneOf(['include', 'exclude']).isRequired
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired
}
