import React from 'react'
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
  includedItems,
  excludedItems,
  onToggle,
  onClear
}) {
  const activeItemCount = includedItems.size + excludedItems.size

  return (
    <PopoverCard
      popoverId={popoverId}
      anchorName={anchorName}
      trigger={
        <FilterPopoverTrigger triggerLabel={triggerLabel} activeItemCount={activeItemCount} />
      }
    >
      <div className="flex flex-col gap-3 min-w-80 max-w-96">
        <FilterPopoverHeader title={title} description={description} />
        <ActiveFilterList
          includedItems={includedItems}
          excludedItems={excludedItems}
          onToggle={onToggle}
          onClear={onClear}
        />
        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
          {items.map((item) => (
            <FilterOptionRow
              key={item}
              item={item}
              isIncluded={includedItems.has(item)}
              isExcluded={excludedItems.has(item)}
              onToggle={onToggle}
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
  includedItems: PropTypes.instanceOf(Set).isRequired,
  excludedItems: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired
}
