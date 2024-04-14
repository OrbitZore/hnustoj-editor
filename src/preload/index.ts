import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { logRenderer as log } from '../lib/log'

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
    contextBridge.exposeInMainWorld('log', log)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.log = log
}
