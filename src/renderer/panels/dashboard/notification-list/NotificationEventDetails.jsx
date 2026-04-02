import PropTypes from 'prop-types'
import { Badge } from '../../../components/Badge'

export const NotificationEventDetails = ({ activityLabel, eventActor }) => {
  return (
    <div className="flex flex-1 flex-wrap gap-2 justify-end">
      {eventActor && <Badge className="badge-info badge-sm">@{eventActor}</Badge>}
      {activityLabel && <Badge className="badge-info badge-sm">{activityLabel}</Badge>}
    </div>
  )
}

NotificationEventDetails.propTypes = {
  activityLabel: PropTypes.string,
  eventActor: PropTypes.string
}
