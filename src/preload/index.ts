import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  rpcCall(channel, method, obj) {
    ipcRenderer.send('rpcCall', channel, method, obj)
  },
  lsp: {
    change(change) {
      return ipcRenderer.invoke('lsp.change', change)
    },
    reload(languageId, text) {
      return ipcRenderer.invoke('lsp.reload', languageId, text)
    },
    save(text) {
      return ipcRenderer.invoke('lsp.save', text)
    },
    requestCompletion(versionId, position, triggerKind, triggerCharacter) {
      return ipcRenderer.invoke(
        'lsp.requestCompletion',
        versionId,
        position,
        triggerKind,
        triggerCharacter
      )
    }
  }
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
