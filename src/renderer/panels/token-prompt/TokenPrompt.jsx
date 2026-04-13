import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { PanelState } from '../../utils/PanelState.jsx'
import { Button } from '../../components/Button.jsx'

export function TokenPrompt({ setPanelState }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [hasExistingToken, setHasExistingToken] = useState(false)

  useEffect(() => {
    globalThis.api.hasToken().then(setHasExistingToken)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token.trim()) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      await globalThis.api.setToken(token.trim())
      setPanelState(PanelState.LOADING)
    } catch (err) {
      console.error(err)
      setError('Failed to save token')
    } finally {
      setSaving(false)
    }
  }

  const handleRetry = () => {
    setPanelState(PanelState.LOADING)
  }

  return (
    <div className="mx-auto flex h-screen w-1/2 flex-col items-center justify-center gap-4">
      <h2 className="text-3xl">Enter GitHub Token</h2>
      <p>
        Run <code>gh auth token</code> and enter the token here. You can also create a GitHub
        Personal Access Token with the <code>notifications</code> and <code>repo</code> scopes.
      </p>
      <form onSubmit={handleSubmit} className="join w-full">
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="gho_... or ghp_..."
          className="input input-bordered w-full join-item"
        />
        <button
          className="btn btn-primary btn-outline join-item"
          type="submit"
          disabled={saving || !token.trim()}
        >
          {saving ? 'Saving...' : 'Save token'}
        </button>
      </form>
      <div className="flex flex-col gap-2">or</div>
      {hasExistingToken && (
        <Button variant="primary" onClick={handleRetry}>
          Retry current token
        </Button>
      )}
      {error && <p className="text-error">{error}</p>}
    </div>
  )
}

TokenPrompt.propTypes = {
  setPanelState: PropTypes.func.isRequired
}
