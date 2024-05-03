import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

function makeipc(ipcname) {
  return (...args) => {
    console.log('invoke', ipcname, args)
    return ipcRenderer.invoke(ipcname, ...args)
  }
}

// Custom APIs for renderer
const api = {
  rpcCall(channel, method, obj) {
    ipcRenderer.send('rpcCall', channel, method, obj)
  },
  lsp: {
    change: makeipc('lsp.change'),
    open: makeipc('lsp.open'),
    changeLanguage: makeipc('lsp.changeLanguage'),
    close: makeipc('lsp.close'),
    save: makeipc('lsp.save'),
    getInitializeResult: makeipc('lsp.getInitializeResult'),
    requestCompletion: makeipc('lsp.requestCompletion')
  },
  menu: {
    langChoose: makeipc('menu.langChoose')
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
