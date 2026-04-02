import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { PanelState } from '../../utils/PanelState.jsx'

export const Loading = ({ setPanelState, notifications }) => {
  useEffect(() => {
    const checkReady = async () => {
      const hasValidToken = await globalThis.api.hasValidToken()

      if (!hasValidToken) {
        setPanelState(PanelState.TOKEN_PROMPT)
        return
      }

      if (notifications !== null) {
        setPanelState(PanelState.DASHBOARD)
      }
    }

    void checkReady()
  }, [setPanelState, notifications])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-3xl">GitHub Notification Manager</h2>
      <span className="loading loading-spinner loading-xl"></span>
      <p>Loading notifications...</p>
    </div>
  )
}

Loading.propTypes = {
  setPanelState: PropTypes.func.isRequired,
  notifications: PropTypes.array
}
