import { LanguageClient, clangdLanguageServer } from '../lib/LanguageServer'
import * as lsp from 'vscode-languageserver-protocol'
import type * as monaco from 'monaco-editor'
import log from 'electron-log/main.js'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import * as tmp from 'tmp'
import { remove as remove_ } from 'fs-extra'
const remove = promisify(remove_)
import { promisify } from 'util'
import { open } from 'fs/promises'
export type LanguageSupportedKey = 'cpp'
const lspClientLog = log.scope('lsp')
class LSPClient {
  lang?: LanguageSupportedKey
  filePath?: string
  languageClient?: LanguageClient
  sender?: Electron.WebContents
  dispose() {
    this.languageClient?.dispose()
    this.languageClient = undefined
    if (this.filePath) {
      remove(this.filePath)
    }
    this.filePath = undefined
  }
  async reload(_event: IpcMainInvokeEvent, lang: LanguageSupportedKey, text: string) {
    this.sender = _event.sender
    switch (lang) {
      case 'cpp':
        this.dispose()
        this.filePath = (await promisify(tmp.file)()) + '.cpp'
        this.languageClient = clangdLanguageServer(
          this.filePath,
          this.onPublishDiagnostics.bind(this)
        )
        break
    }
    this.lang = lang
    this.languageClient.onError((error) => {
      lspClientLog.error('error!', error)
    })
    await this.languageClient.trace(lsp.Trace.Verbose, lspClientLog)
    this.languageClient.listen()
    const ret = await this.languageClient.initialize()
    await this.languageClient.initialized()
    await this.languageClient.open(lang, text)
    return ret
  }
  async save(_event: IpcMainInvokeEvent, text: string) {
    if (this.filePath) {
      const fd = await open(this.filePath, 'w')
      await fd.write(text, undefined, 'utf8')
      await fd.close()
    }
  }
  async onChange(_event: IpcMainInvokeEvent, changeEvent: monaco.editor.IModelContentChangedEvent) {
    await this.languageClient?.didChange(changeEvent)
  }
  onPublishDiagnostics(publishDiagnostics: lsp.PublishDiagnosticsParams) {
    if (this.sender && publishDiagnostics.uri === 'file://' + this.filePath) {
      this.sender.send('PublishDiagnostics', publishDiagnostics.diagnostics)
    }
  }
  async requestCompletion(
    _event: IpcMainInvokeEvent,
    versionId: number,
    position: monaco.Position,
    triggerKind: number,
    triggerCharacter?: string
  ): Promise<monaco.languages.CompletionList> {
    return (
      (await this.languageClient?.requestCompletion(
        versionId,
        position,
        triggerKind,
        triggerCharacter
      )) || {
        suggestions: []
      }
    )
  }
}
const lsc = new LSPClient()
ipcMain.handle('lsp.change', lsc.onChange.bind(lsc))
ipcMain.handle('lsp.reload', lsc.reload.bind(lsc))
ipcMain.handle('lsp.save', lsc.save.bind(lsc))
ipcMain.handle('lsp.requestCompletion', lsc.requestCompletion.bind(lsc))
export default lsc
