import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '../../../components/Button'
import CloseIcon from '../../../assets/icons/close.svg?react'

export function NotificationDetailsDialog({ dialogRef, title, notification }) {
  const detailsJson = React.useMemo(() => JSON.stringify(notification, null, 2), [notification])

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box w-11/12 max-w-4xl">
        <form method="dialog" className="flex justify-end">
          <Button type="submit" aria-label={`Close details for ${title}`} tooltip="Close">
            <CloseIcon className="size-4 shrink-0 fill-current" />
          </Button>
        </form>

        <h3 className="text-lg font-bold">Notification details</h3>
        <p className="py-2 text-sm text-base-content/70">{title}</p>

        <pre className="mt-2 max-h-[70vh] overflow-auto rounded-lg bg-base-200 p-4 text-xs leading-5">
          <code>{detailsJson}</code>
        </pre>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  )
}

NotificationDetailsDialog.propTypes = {
  dialogRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({
      current: PropTypes.instanceOf(globalThis.HTMLDialogElement)
    })
  ]).isRequired,
  title: PropTypes.string.isRequired,
  notification: PropTypes.object.isRequired
}
