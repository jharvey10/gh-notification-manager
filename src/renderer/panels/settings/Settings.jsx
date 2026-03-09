import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from '../../components/Button'
import { useSettings } from '../../hooks/useSettings'
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
  const [osNotificationsEnabled, setOsNotificationsEnabled] = useState(settings.osNotificationsEnabled)
  const [autoMarkDoneEnabled, setAutoMarkDoneEnabled] = useState(settings.autoMarkDoneEnabled)
  const [autoMarkDoneDays, setAutoMarkDoneDays] = useState(String(settings.autoMarkDoneDays))
  const [olderThanDays, setOlderThanDays] = useState(String(settings.olderThanDays))

  useEffect(() => {
    setOsNotificationsEnabled(settings.osNotificationsEnabled)
    setAutoMarkDoneEnabled(settings.autoMarkDoneEnabled)
    setAutoMarkDoneDays(String(settings.autoMarkDoneDays))
    setOlderThanDays(String(settings.olderThanDays))
  }, [settings])

  const handleSaveOsNotifications = async () => {
    setSavingOsNotifications(true)
    try {
      await updateSettings({ osNotificationsEnabled })
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
      await globalThis.api.refreshNow()
    } finally {
      setSavingAutoMarkDone(false)
    }
  }

  const handleSaveOlderWindow = async () => {
    setSavingOlderWindow(true)
    try {
      await updateSettings({ olderThanDays })
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

      <OsNotificationsSection
        osNotificationsEnabled={osNotificationsEnabled}
        savingOsNotifications={savingOsNotifications}
        onOsNotificationsEnabledChange={setOsNotificationsEnabled}
        onSave={handleSaveOsNotifications}
        onTestNotification={handleTestNotification}
      />

      <OlderSectionSettings
        olderThanDays={olderThanDays}
        savingOlderWindow={savingOlderWindow}
        onOlderThanDaysChange={setOlderThanDays}
        onSave={handleSaveOlderWindow}
      />

      <AuthTokenSection onChangeToken={handleChangeToken} onClearToken={handleClearToken} />
    </div>
  )
}

Settings.propTypes = {
  setPanelState: PropTypes.func.isRequired
}
