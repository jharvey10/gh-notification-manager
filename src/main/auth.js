const { safeStorage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { app } = require('electron');

function tokenPath() {
  return path.join(app.getPath('userData'), 'gh-token.enc');
}

function hasToken() {
  return fs.existsSync(tokenPath());
}

function saveToken(token) {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption not available on this system');
  }
  const encrypted = safeStorage.encryptString(token);
  fs.writeFileSync(tokenPath(), encrypted);
}

function loadToken() {
  if (!hasToken()) return null;
  if (!safeStorage.isEncryptionAvailable()) return null;
  const encrypted = fs.readFileSync(tokenPath());
  return safeStorage.decryptString(encrypted);
}

function clearToken() {
  if (fs.existsSync(tokenPath())) {
    fs.unlinkSync(tokenPath());
  }
}

module.exports = { hasToken, saveToken, loadToken, clearToken };
