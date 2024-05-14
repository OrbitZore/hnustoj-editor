import * as lsp from 'vscode-languageserver-protocol'
import type * as monaco from 'monaco-editor'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import * as fs from 'fs/promises'
export type LanguageSupportedKey = 'cpp'
import * as hal from '@lib'
import log from 'electron-log/main.js'
const lspClientLog = log.scope('LSPClient')
function pathToURI(path: string) {
  return 'file://' + path
}

function uriToPath(uri: string) {
  return uri.slice(7)
}

class LSPClient {
  fileMeta = new Map<
    string,
    {
      languagekey: string
      sender: Electron.WebContents
    }
  >()
  async open(_event: IpcMainInvokeEvent, path: string, languagekey: string) {
    lspClientLog.log('open', path, languagekey, _event)
    const uri = pathToURI(path)
    const ls = hal.getLanguageProvider(languagekey)
    if (!ls) return
    this.fileMeta.set(path, { languagekey, sender: _event.sender })
    const fd = await fs.open(path, 'a+')
    const fileContent = await fd.readFile('utf8')
    await ls.open(uri, languagekey, fileContent)
    fd.close()
    return fileContent
  }
  async close(_event: IpcMainInvokeEvent, path: string) {
    const filemeta = this.fileMeta.get(path)
    if (!filemeta) return
    const ls = hal.getLanguageProvider(filemeta.languagekey)
    const uri = pathToURI(path)
    this.fileMeta.delete(path)
    return ls?.close(uri)
  }
  async save(_event: IpcMainInvokeEvent, path: string, text: string) {
    const fd = await fs.open(path, 'w')
    await fd.write(text)
    await fd.close()
  }
  async changeLanguage(_event: IpcMainInvokeEvent, path: string, languagekey: string) {
    const uri = pathToURI(path)
    const filemeta = this.fileMeta.get(path)
    if (!filemeta) return
    const oldls = hal.getLanguageProvider(filemeta.languagekey)
    await oldls?.close(pathToURI(path))
    const newls = hal.getLanguageProvider(languagekey)
    await newls?.open(uri, languagekey, await fs.readFile(path, 'utf8'))
    this.fileMeta.set(path, { languagekey, sender: _event.sender })
  }
  async change(
    _event: IpcMainInvokeEvent,
    path: string,
    changeEvent: monaco.editor.IModelContentChangedEvent
  ) {
    const filemeta = this.fileMeta.get(path)
    if (!filemeta) return
    const ls = hal.getLanguageProvider(filemeta.languagekey)
    const uri = pathToURI(path)
    await ls?.didChange(uri, changeEvent)
  }
  onPublishDiagnostics(publishDiagnostics: lsp.PublishDiagnosticsParams) {
    const sender = this.fileMeta.get(uriToPath(publishDiagnostics.uri))?.sender
    if (!sender) return
    sender.send('PublishDiagnostics', publishDiagnostics)
  }
  getInitializeResult(_event: IpcMainInvokeEvent, lang: string) {
    const provider = hal.getLanguageProvider(lang)
    return provider?.initializeResult
  }
  async requestCompletion(
    _event: IpcMainInvokeEvent,
    path: string,
    versionId: number,
    position: monaco.Position,
    triggerKind: number,
    triggerCharacter?: string
  ): Promise<monaco.languages.CompletionList> {
    const filemeta = this.fileMeta.get(path)
    const ls = hal.getLanguageProvider(filemeta?.languagekey)
    return (
      (await ls?.requestCompletion(
        pathToURI(path),
        versionId,
        position,
        triggerKind,
        triggerCharacter
      )) || {
        suggestions: []
      }
    )
  }
  async compile(_event: IpcMainInvokeEvent, filename: string, execCmd?: string) {
    const filemeta = this.fileMeta.get(filename)
    const ls = hal.getLanguageProvider(filemeta?.languagekey)
    return ls?.compile(filename, execCmd)
  }
  async run(
    _event: IpcMainInvokeEvent,
    filename: string,
    execArgs?: string,
    options?: hal.RunOptions
  ) {
    const filemeta = this.fileMeta.get(filename)
    const ls = hal.getLanguageProvider(filemeta?.languagekey)
    return ls?.run(filename, execArgs, options)
  }
}
const lsc = new LSPClient()
hal.setLanguageServerEventHandler(lsc)
ipcMain.handle('lsp.change', lsc.change.bind(lsc))
ipcMain.handle('lsp.open', lsc.open.bind(lsc))
ipcMain.handle('lsp.changeLanguage', lsc.changeLanguage.bind(lsc))
ipcMain.handle('lsp.close', lsc.close.bind(lsc))
ipcMain.handle('lsp.save', lsc.save.bind(lsc))
ipcMain.handle('lsp.requestCompletion', lsc.requestCompletion.bind(lsc))
ipcMain.handle('lsp.getInitializeResult', lsc.getInitializeResult.bind(lsc))
ipcMain.handle('lsp.compile', lsc.compile.bind(lsc))
ipcMain.handle('lsp.run', lsc.run.bind(lsc))
export default lsc
