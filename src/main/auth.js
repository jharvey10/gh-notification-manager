import { safeStorage, app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { VALIDATE_TOKEN_QUERY } from './github/queries/validateToken.js'

function tokenPath() {
  return path.join(app.getPath('userData'), 'gh-token.enc')
}

function hasToken() {
  return fs.existsSync(tokenPath())
}

function saveToken(token) {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption not available on this system')
  }
  const encrypted = safeStorage.encryptString(token)
  fs.writeFileSync(tokenPath(), encrypted)
}

function loadToken() {
  if (!hasToken()) {
    return null
  }
  if (!safeStorage.isEncryptionAvailable()) {
    return null
  }
  const encrypted = fs.readFileSync(tokenPath())
  return safeStorage.decryptString(encrypted)
}

function clearToken() {
  if (fs.existsSync(tokenPath())) {
    fs.unlinkSync(tokenPath())
  }
}

async function validateToken(gql) {
  if (!hasToken()) {
    return { valid: false }
  }

  try {
    await gql(VALIDATE_TOKEN_QUERY)
    return { valid: true }
  } catch (err) {
    console.log(JSON.stringify(err, null, 2))
    if (err.status === 401) {
      return { valid: false, message: 'Token is invalid or has been revoked.' }
    }
    if (err.status === 403) {
      return { valid: false, message: 'Token does not have permission to access notifications.' }
    }
    return { valid: false, message: 'An unknown error occurred while validating the token.' }
  }
}

export { hasToken, saveToken, loadToken, clearToken, validateToken }
