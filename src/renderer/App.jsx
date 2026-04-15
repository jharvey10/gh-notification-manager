import { useEffect, useLayoutEffect, useState } from 'react'
import { TokenPrompt } from './panels/token-prompt/TokenPrompt.jsx'
import { Dashboard } from './panels/dashboard/Dashboard.jsx'
import { Settings } from './panels/settings/Settings.jsx'
import { PanelState } from './utils/PanelState.jsx'
import { Loading } from './panels/loading/Loading.jsx'
import { useNotifications } from './hooks/useNotifications.js'
import { useBatchProgress } from './hooks/useBatchProgress.js'
import { useErrors } from './hooks/useErrors.js'
import { ErrorAlerts } from './components/ErrorAlerts.jsx'

export function App() {
  const { errors, dismissError } = useErrors()
  const [panelState, setPanelState] = useState(PanelState.LOADING)
  const { notifications } = useNotifications()
  const batchProgress = useBatchProgress()

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
      panel = <Dashboard setPanelState={setPanelState} notifications={notifications} batchProgress={batchProgress} />
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
