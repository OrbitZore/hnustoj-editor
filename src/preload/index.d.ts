import type * as lib from './../lib/index'
import { ElectronAPI } from '@electron-toolkit/preload'
import { RendererLogger } from 'electron-log'
import * as lsp from 'vscode-languageserver-protocol'
import type * as monaco from 'monaco-editor'
interface api {
  rpcCall: (channel: 'C++' | 'Python' | 'Java', method: string, obj: object) => object
  lsp: {
    change: (path: string, changeEvent: monaco.editor.IModelContentChangedEvent) => Promise<void>
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
    compile: (filename: string, execCmd?: string) => Promise<lib.CompilerResult | undefined>
    run: (
      filename: string,
      execArgs?: string,
      options?: lib.RunOptions
    ) => Promise<lib.RunResult | undefined>
  }
  term: {
    open: () => Promise<number>
    stdin: (id: number, data: string) => Promise<void>
    close: (id: number) => Promise<void>
    resize: (id: number, columns: number, rows: number) => Promise<void>
  }
  menu: {
    langChoose: () => Promise<string>
  }
  oj: {
    list: () => Promise<lib.ListOnlineJudgerProviderResult>
    login: (key: string) => Promise<lib.User | null>
    getContestList: (
      key: string,
      options: lib.ContestFilter
    ) => Promise<lib.ContestMeta[] | undefined>
    getContestInfo: (key: string, contestid: string) => Promise<lib.ContestInfo | undefined>
    getContestTags: () => Promise<string[] | undefined>
    getProblemInfo: (key: string, problemid: string) => Promise<lib.ProblemInfo | undefined>
  }
}
declare global {
  interface Window {
    electron: ElectronAPI
    api: api
    log: RendererLogger
  }
}
