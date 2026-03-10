import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from '../../components/Button'
import { useSettings } from '../../hooks/useSettings'
import { pickOsSettings } from '../../../shared/settings.js'
import { PanelState } from '../../utils/PanelState'
import { AutoDoneSection } from './settings-sections/AutoDoneSection'
import { AuthTokenSection } from './settings-sections/AuthTokenSection'
import { OlderSectionSettings } from './settings-sections/OlderSectionSettings'
import { OsNotificationsSection } from './settings-sections/OsNotificationsSection'

export function Settings({ setPanelState }) {
  const { settings, updateSettings } = useSettings()
  const [savingOsNotifications, setSavingOsNotifications] = useState(false)
  const [savingAutoMarkDone, setSavingAutoMarkDone] = useState(false)
  const [savingOlderWindow, setSavingOlderWindow] = useState(false)
  const [toast, setToast] = useState(null)
  const [osSettings, setOsSettings] = useState(() => pickOsSettings(settings))
  const [autoMarkDoneEnabled, setAutoMarkDoneEnabled] = useState(settings.autoMarkDoneEnabled)
  const [autoMarkDoneDays, setAutoMarkDoneDays] = useState(String(settings.autoMarkDoneDays))
  const [olderThanDays, setOlderThanDays] = useState(String(settings.olderThanDays))

  useEffect(() => {
    setOsSettings(pickOsSettings(settings))
    setAutoMarkDoneEnabled(settings.autoMarkDoneEnabled)
    setAutoMarkDoneDays(String(settings.autoMarkDoneDays))
    setOlderThanDays(String(settings.olderThanDays))
  }, [settings])

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timeoutId = globalThis.setTimeout(() => {
      setToast(null)
    }, 2500)

    return () => {
      globalThis.clearTimeout(timeoutId)
    }
  }, [toast])

  const showSavedToast = (message) => {
    setToast({ id: Date.now(), message })
  }

  const handleOsSettingChange = (key, value) => {
    setOsSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveOsNotifications = async () => {
    setSavingOsNotifications(true)
    try {
      await updateSettings(osSettings)
      showSavedToast('OS notifications saved')
    } finally {
      setSavingOsNotifications(false)
    }
  }

  const handleSaveAutoMarkDone = async () => {
    setSavingAutoMarkDone(true)
    try {
      await updateSettings({
        autoMarkDoneEnabled,
        autoMarkDoneDays
      })
      if (autoMarkDoneEnabled) {
        showSavedToast('Auto-done settings saved. Cleanup will run in the background.')
      } else {
        showSavedToast('Auto-done settings saved.')
      }
    } finally {
      setSavingAutoMarkDone(false)
    }
  }

  const handleSaveOlderWindow = async () => {
    setSavingOlderWindow(true)
    try {
      await updateSettings({ olderThanDays })
      showSavedToast('Older section settings saved')
    } finally {
      setSavingOlderWindow(false)
    }
  }

  const handleChangeToken = async () => {
    await globalThis.api.clearToken()
    setPanelState(PanelState.TOKEN_PROMPT)
  }

  const handleClearToken = async () => {
    await globalThis.api.clearToken()
    setPanelState(PanelState.TOKEN_PROMPT)
  }

  const handleTestNotification = () => {
    globalThis.api.testOsNotification()
  }

  return (
    <>
      <div className="toast z-50">
        {toast ? (
          <div className="alert alert-success shadow-lg">
            <span>{toast.message}</span>
          </div>
        ) : null}
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl">Settings</h2>
            <p className="text-base-content/70">Configure application settings.</p>
          </div>
          <Button onClick={() => setPanelState(PanelState.DASHBOARD)}>&larr; Back</Button>
        </div>

        <AutoDoneSection
          autoMarkDoneEnabled={autoMarkDoneEnabled}
          autoMarkDoneDays={autoMarkDoneDays}
          savingAutoMarkDone={savingAutoMarkDone}
          onAutoMarkDoneEnabledChange={setAutoMarkDoneEnabled}
          onAutoMarkDoneDaysChange={setAutoMarkDoneDays}
          onSave={handleSaveAutoMarkDone}
        />

        <OlderSectionSettings
          olderThanDays={olderThanDays}
          savingOlderWindow={savingOlderWindow}
          onOlderThanDaysChange={setOlderThanDays}
          onSave={handleSaveOlderWindow}
        />

        <OsNotificationsSection
          settings={osSettings}
          savingOsNotifications={savingOsNotifications}
          onSettingChange={handleOsSettingChange}
          onSave={handleSaveOsNotifications}
          onTestNotification={handleTestNotification}
        />

        <AuthTokenSection onChangeToken={handleChangeToken} onClearToken={handleClearToken} />
      </div>
    </>
  )
}

Settings.propTypes = {
  setPanelState: PropTypes.func.isRequired
}
