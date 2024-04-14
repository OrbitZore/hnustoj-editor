import { ElectronAPI } from '@electron-toolkit/preload'
import { RendererLogger } from 'electron-log'
import * as lsp from 'vscode-languageserver-protocol'
interface api {
  rpcCall: (channel: 'C++' | 'Python' | 'Java', method: string, obj: object) => object
  lsp: {
    change: (changeEvent: monaco.IModelContentChangedEvent) => Promise<void>
    save: (text: string) => Promise<void>
    reload: (languageId: string, text: string) => Promise<lsp.InitializeResult<unknown>>
    requestCompletion(
      versionId: number,
      position: monaco.Position,
      triggerKind: number,
      triggerCharacter?: string
    ): Promise<monaco.languages.CompletionList>
  }
}
declare global {
  interface Window {
    electron: ElectronAPI
    api: api
    log: RendererLogger
  }
}
