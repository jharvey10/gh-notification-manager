import React, { useEffect, useLayoutEffect, useState } from 'react'
import { TokenPrompt } from './panels/token-prompt/TokenPrompt'
import { Dashboard } from './panels/dashboard/Dashboard'
import { Settings } from './panels/settings/Settings'
import { PanelState } from './utils/PanelState'
import { Loading } from './panels/loading/Loading'
import { useNotifications } from './hooks/useNotifications'
import { useErrors } from './hooks/useErrors'
import { ErrorAlerts } from './components/ErrorAlerts'

export function App() {
  const { errors, dismissError } = useErrors()
  const [panelState, setPanelState] = useState(PanelState.LOADING)
  const { notifications, refresh } = useNotifications()

  useEffect(() => {
    globalThis.api.signalReady()
  }, [])

  useLayoutEffect(() => {
    globalThis.scrollTo?.(0, 0)
  }, [panelState])

  let panel = null

  switch (panelState) {
    case PanelState.LOADING:
      panel = <Loading setPanelState={setPanelState} notifications={notifications} />
      break
    case PanelState.TOKEN_PROMPT:
      panel = <TokenPrompt setPanelState={setPanelState} />
      break
    case PanelState.DASHBOARD:
      panel = (
        <Dashboard setPanelState={setPanelState} notifications={notifications} refresh={refresh} />
      )
      break
    case PanelState.SETTINGS:
      panel = <Settings setPanelState={setPanelState} />
      break
  }

  return (
    <>
      {panel}
      <div className="fixed bottom-0 right-0 z-50 w-full">
        <ErrorAlerts errors={errors} onDismiss={dismissError} />
      </div>
    </>
  )
}
