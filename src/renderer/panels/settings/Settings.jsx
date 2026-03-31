import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from '../../components/Button'
import { useSettings } from '../../hooks/useSettings'
import { pickOSSettings, OS_NOTIFICATION_KEYS } from '../../../shared/settings.js'
import { PanelState } from '../../utils/PanelState'
import { AutoDoneSection } from './settings-sections/AutoDoneSection'
import { AuthTokenSection } from './settings-sections/AuthTokenSection'
import { OlderSectionSettings } from './settings-sections/OlderSectionSettings'
import { OsNotificationsSection } from './settings-sections/OsNotificationsSection'
import { VersionSection } from './settings-sections/version-section/VersionSection'

export function Settings({ setPanelState }) {
  const { settings, updateSettings } = useSettings()
  const [appVersion, setAppVersion] = useState('')
  const [savingOsNotifications, setSavingOsNotifications] = useState(false)
  const [savingAutoMarkDone, setSavingAutoMarkDone] = useState(false)
  const [savingOlderWindow, setSavingOlderWindow] = useState(false)
  const [toast, setToast] = useState(null)
  const [osSettings, setOSSettings] = useState(() => pickOSSettings(settings))
  const [autoMarkDoneEnabled, setAutoMarkDoneEnabled] = useState(settings.autoMarkDoneEnabled)
  const [autoMarkDoneDays, setAutoMarkDoneDays] = useState(String(settings.autoMarkDoneDays))
  const [olderThanDays, setOlderThanDays] = useState(String(settings.olderThanDays))

  useEffect(() => {
    setOSSettings(pickOSSettings(settings))
    setAutoMarkDoneEnabled(settings.autoMarkDoneEnabled)
    setAutoMarkDoneDays(String(settings.autoMarkDoneDays))
    setOlderThanDays(String(settings.olderThanDays))
  }, [settings])

  useEffect(() => {
    let mounted = true

    const loadVersion = async () => {
      try {
        const version = await globalThis.api.getVersion()
        if (mounted) {
          setAppVersion(version)
        }
      } catch (err) {
        console.error('Failed to load app version:', err)
      }
    }

    void loadVersion()

    return () => {
      mounted = false
    }
  }, [])

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

  const sectionDirty = useMemo(() => {
    const savedOs = pickOSSettings(settings)
    return {
      osNotifications: OS_NOTIFICATION_KEYS.some((key) => osSettings[key] !== savedOs[key]),
      autoDone:
        autoMarkDoneEnabled !== settings.autoMarkDoneEnabled ||
        autoMarkDoneDays !== String(settings.autoMarkDoneDays),
      older: olderThanDays !== String(settings.olderThanDays)
    }
  }, [osSettings, autoMarkDoneEnabled, autoMarkDoneDays, olderThanDays, settings])

  const isDirty = sectionDirty.osNotifications || sectionDirty.autoDone || sectionDirty.older

  const handleBack = () => {
    if (isDirty && !globalThis.confirm('You have unsaved changes. Leave without saving?')) {
      return
    }
    setPanelState(PanelState.DASHBOARD)
  }

  const handleOSSettingChange = (key, value) => {
    setOSSettings((prev) => ({ ...prev, [key]: value }))
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
          <Button onClick={handleBack}>&larr; Back</Button>
        </div>

        <AutoDoneSection
          autoMarkDoneEnabled={autoMarkDoneEnabled}
          autoMarkDoneDays={autoMarkDoneDays}
          savingAutoMarkDone={savingAutoMarkDone}
          dirty={sectionDirty.autoDone}
          onAutoMarkDoneEnabledChange={setAutoMarkDoneEnabled}
          onAutoMarkDoneDaysChange={setAutoMarkDoneDays}
          onSave={handleSaveAutoMarkDone}
        />

        <OlderSectionSettings
          olderThanDays={olderThanDays}
          savingOlderWindow={savingOlderWindow}
          dirty={sectionDirty.older}
          onOlderThanDaysChange={setOlderThanDays}
          onSave={handleSaveOlderWindow}
        />

        <OsNotificationsSection
          settings={osSettings}
          savingOsNotifications={savingOsNotifications}
          dirty={sectionDirty.osNotifications}
          onSettingChange={handleOSSettingChange}
          onSave={handleSaveOsNotifications}
          onTestNotification={handleTestNotification}
        />

        <AuthTokenSection onClearToken={handleClearToken} />

        <VersionSection appVersion={appVersion} />
      </div>
    </>
  )
}

Settings.propTypes = {
  setPanelState: PropTypes.func.isRequired
}
