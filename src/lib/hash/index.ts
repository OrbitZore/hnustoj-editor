import { safeStorage } from 'electron'

export function encrypt(text: string) {
  if (!safeStorage.isEncryptionAvailable()) {
    return text
  }
  return safeStorage.encryptString(text).toString('base64')
}

export function decript(text: string) {
  if (!safeStorage.isEncryptionAvailable()) {
    return text
  }
  return safeStorage.decryptString(Buffer.from(text, 'base64'))
}
