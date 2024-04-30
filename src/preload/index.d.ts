import { ElectronAPI } from '@electron-toolkit/preload'
import { RendererLogger } from 'electron-log'
import * as lsp from 'vscode-languageserver-protocol'
interface api {
  rpcCall: (channel: 'C++' | 'Python' | 'Java', method: string, obj: object) => object
  lsp: {
    change: (path: string, changeEvent: monaco.IModelContentChangedEvent) => Promise<void>
    open: (path: string, languagekey: string) => Promise<string>
    changeLanguage: (path: string, languagekey: string) => Promise<void>
    close: (path: string) => Promise<lsp.InitializeResult<unknown>>
    save: (path: string, text: string) => Promise<void>
    getInitializeResult(lang: string): Promise<lsp.InitializeResult<unknown>>
    requestCompletion(
      path: string,
      versionId: number,
      position: monaco.Position,
      triggerKind: number,
      triggerCharacter?: string
    ): Promise<monaco.languages.CompletionList>
  }
  menu: {
    langChoose: () => Promise<string>
  }
}
declare global {
  interface Window {
    electron: ElectronAPI
    api: api
    log: RendererLogger
  }
}
