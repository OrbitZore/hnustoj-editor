import { LanguageClient, clangdLanguageServer } from '../lib/LanguageServer'
import * as lsp from 'vscode-languageserver-protocol'
import { editor } from 'monaco-editor'
import { logMain as log } from '../lib/log'
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
        this.filePath = await promisify(tmp.file)()
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
    await this.languageClient.initialize()
    await this.languageClient.initialized()
    await this.languageClient.open(lang, text)
  }
  async onChange(_event: IpcMainInvokeEvent, text: string) {
    if (this.filePath) {
      const fd = await open(this.filePath, 'w')
      await fd.write(text, undefined, 'utf8')
      await fd.close()
    }
    await this.languageClient?.didChange(text)
  }
  onPublishDiagnostics(publishDiagnostics: lsp.PublishDiagnosticsParams) {
    if (this.sender && publishDiagnostics.uri === 'file://' + this.filePath) {
      this.sender.send('PublishDiagnostics', publishDiagnostics.diagnostics)
    }
  }
}
const lsc = new LSPClient()
ipcMain.handle('lsp.change', lsc.onChange.bind(lsc))
ipcMain.handle('lsp.reload', lsc.reload.bind(lsc))
export default lsc
