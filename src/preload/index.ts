import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

function makeipc(ipcname) {
  return async (...args) => {
    console.log('invoke', ipcname, args)
    const reuslt = await ipcRenderer.invoke(ipcname, ...args)
    console.log('invoke', ipcname, args, '=>', reuslt)
    return reuslt
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
  term: {
    open: makeipc('term.open'),
    stdin: makeipc('term.stdin'),
    close: makeipc('term.close'),
    resize: makeipc('term.resize')
  },
  oj: {
    list: makeipc('oj.list'),
    login: makeipc('oj.login'),
    getContestList: makeipc('oj.getContestList'),
    getContestInfo: makeipc('oj.getContestInfo'),
    getContestTags: makeipc('oj.getContestTags')
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
