import PropTypes from 'prop-types'
import { Filters } from './Filters.jsx'
import { SettingsMenu } from './SettingsMenu.jsx'

export const TopBar = ({
  notifications,
  filters,
  onTextChange,
  onBooleanChange,
  onTagChange,
  onRepoChange,
  onClearTags,
  onClearRepos,
  onOpenSettings
}) => {
  return (
    <div className="flex w-full flex-wrap items-start justify-between gap-3">
      <Filters
        notifications={notifications}
        filters={filters}
        onTextChange={onTextChange}
        onBooleanChange={onBooleanChange}
        onTagChange={onTagChange}
        onRepoChange={onRepoChange}
        onClearTags={onClearTags}
        onClearRepos={onClearRepos}
      />
      <div className="flex items-center gap-2">
        <SettingsMenu onOpenSettings={onOpenSettings} />
      </div>
    </div>
  )
}

TopBar.propTypes = {
  notifications: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  onTextChange: PropTypes.func.isRequired,
  onBooleanChange: PropTypes.func.isRequired,
  onTagChange: PropTypes.func.isRequired,
  onRepoChange: PropTypes.func.isRequired,
  onClearTags: PropTypes.func.isRequired,
  onClearRepos: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func.isRequired
}
