import * as auth from '../../auth.js'
import { broadcastError } from '../../broadcastError.js'

export async function hasValidToken() {
  const result = await auth.validateToken()
  if (result.valid) {
    return true
  }

  if (result.message) {
    broadcastError('auth', result.message)
  }
  return false
}
