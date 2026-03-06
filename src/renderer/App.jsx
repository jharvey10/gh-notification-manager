import React, { useState } from 'react'
import { TokenPrompt } from './panels/TokenPrompt'
import { Dashboard } from './panels/Dashboard'
import { PanelState } from './utils/PanelState'
import { Loading } from './panels/Loading'

export function App() {
  const [panelState, setPanelState] = useState(PanelState.LOADING)
  switch (panelState) {
    case PanelState.LOADING:
      return <Loading setPanelState={setPanelState} />
    case PanelState.TOKEN_PROMPT:
      return <TokenPrompt setPanelState={setPanelState} />
    case PanelState.DASHBOARD:
      return <Dashboard setPanelState={setPanelState} />
  }

  return null
}
