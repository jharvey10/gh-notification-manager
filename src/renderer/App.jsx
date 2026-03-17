import React, { useEffect, useLayoutEffect, useState } from 'react'
import { TokenPrompt } from './panels/token-prompt/TokenPrompt'
import { Dashboard } from './panels/dashboard/Dashboard'
import { Settings } from './panels/settings/Settings'
import { PanelState } from './utils/PanelState'
import { Loading } from './panels/loading/Loading'
import { useNotifications } from './hooks/useNotifications'

export function App() {
  const [panelState, setPanelState] = useState(PanelState.LOADING)
  const { notifications, refresh } = useNotifications()

  useEffect(() => {
    return globalThis.api.onMainError(({ source, message }) => {
      console.error(`[main/${source}]`, message)
    })
  }, [])

  useLayoutEffect(() => {
    globalThis.scrollTo?.(0, 0)
  }, [panelState])

  switch (panelState) {
    case PanelState.LOADING:
      return <Loading setPanelState={setPanelState} notifications={notifications} />
    case PanelState.TOKEN_PROMPT:
      return <TokenPrompt setPanelState={setPanelState} />
    case PanelState.DASHBOARD:
      return (
        <Dashboard
          setPanelState={setPanelState}
          notifications={notifications}
          refresh={refresh}
        />
      )
    case PanelState.SETTINGS:
      return <Settings setPanelState={setPanelState} />
  }

  return null
}
