import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { PanelState } from '../../utils/PanelState'

export const Loading = ({ setPanelState }) => {
  useEffect(() => {
    const doLoad = async () => {
      const hasToken = await globalThis.api.hasToken()

      if (hasToken) {
        await globalThis.api.refreshNow()
        setPanelState(PanelState.DASHBOARD)
      } else {
        setPanelState(PanelState.TOKEN_PROMPT)
      }
    }

    void doLoad()
  }, [setPanelState])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-3xl">GitHub Notification Manager</h2>
      <span className="loading loading-spinner loading-xl"></span>
      <p>Loading notifications...</p>
    </div>
  )
}

Loading.propTypes = {
  setPanelState: PropTypes.func.isRequired
}
