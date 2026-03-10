import React, { useLayoutEffect, useState } from 'react'
import { TokenPrompt } from './panels/token-prompt/TokenPrompt'
import { Dashboard } from './panels/dashboard/Dashboard'
import { Settings } from './panels/settings/Settings'
import { PanelState } from './utils/PanelState'
import { Loading } from './panels/loading/Loading'

export function App() {
  const [panelState, setPanelState] = useState(PanelState.LOADING)

  useLayoutEffect(() => {
    globalThis.scrollTo?.(0, 0)
  }, [panelState])

  switch (panelState) {
    case PanelState.LOADING:
      return <Loading setPanelState={setPanelState} />
    case PanelState.TOKEN_PROMPT:
      return <TokenPrompt setPanelState={setPanelState} />
    case PanelState.DASHBOARD:
      return <Dashboard setPanelState={setPanelState} />
    case PanelState.SETTINGS:
      return <Settings setPanelState={setPanelState} />
  }

  return null
}
