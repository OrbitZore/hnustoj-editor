import * as lsp from 'vscode-languageserver-protocol'
import type * as monaco from 'monaco-editor'
import { WebviewTag } from 'electron'
export interface User {
  userid: string
  username: string
  extra: object
}

export interface LoginedUser extends User {
  token: string
}

export interface TestCase {
  _in: string
  ans: string
  judger: (_in: string, out: string, ans: string) => number
}

export interface Problem {
  creator: string
  problemid: string
  tags: string[]
  discribe: string
  tests: TestCase
}

export class TimeInterval {
  constructor(
    public begin: Date,
    public end: Date
  ) {}
}

export interface Contest {
  Contestid: string
  ContestInfo: string
  ContestDuration: TimeInterval
  problems: Problem[]
}

export enum JudgeResult {
  Pending,
  PendingRejudge,
  Compiling,
  RunningJudging,
  Accepted,
  PresentationError,
  WrongAnswer,
  TimeLimitExceeded,
  MemoryLimitExceeded,
  OutputLimitExceeded,
  RuntimeError,
  CompileError
}

export interface Submit {
  userid: string
  lang: string
  problemid: string
  code: string
  status: JudgeResult
}

export interface RankItem {
  problemid: string
  fail: number
  lastSuccessTime?: Date
  score: number
}

export interface UserRank {
  userid: string
  UserRankItem: RankItem[]
}

export interface Pagination {
  offset: number
  limit: number
}

export interface OnlineJudger {
  name: string
  logined: boolean
  loadLoginView(webview: WebviewTag)
  getContestList(options: Pagination): Contest[]
  getRank(contestid: string): UserRank[]
  getProblemList(options: Pagination): Problem[]
  getCommit(userid: string, options: Pagination): Submit[]
  whoami(): User
}

export interface LanguageClient extends lsp.ProtocolConnection {
  initialize(): Promise<lsp.InitializeResult<unknown>>
  initialized(): Promise<void>
  open(uri: string, languageId: string, text: string): Promise<void>
  close(uri: string): Promise<void>
  didChange(uri: string, changes: monaco.editor.IModelContentChangedEvent): Promise<void>
  onPublishDiagnostics(
    publishDiagnosticsHandler: (publishDiagnostics: lsp.PublishDiagnosticsParams) => void
  ): void
  requestCompletion(
    uri: string,
    versionId: number,
    position: monaco.Position,
    triggerKind: number,
    triggerCharacter?: string
  ): Promise<monaco.languages.CompletionList>
}

export interface LanguageSupported {
  languageKey: string
  shortcut: string[]
}

export interface CompilerResult {
  code: number
  stdout: string
  outfilename: string
}

export interface RunOptions {
  detached: boolean
  input?: string
  timelimit?: number
}

export interface RunResult {
  judgeResult: JudgeResult
  code: number
  output: string
  stderr: string
}

export interface LanguageProvider extends LanguageClient {
  languageSupported: LanguageSupported[]
  initializeResult: lsp.InitializeResult<unknown>
  compile(filename: string, execCmd?: string): Promise<CompilerResult>
  run(filename: string, execArgs?: string, options?: RunOptions): Promise<RunResult>
}

export interface LanguageServerEventHandler {
  onPublishDiagnostics(publishDiagnostics: lsp.PublishDiagnosticsParams): void
}

let languageServerEventHandler = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  onPublishDiagnostics(_publishDiagnostics: lsp.PublishDiagnosticsParams) {}
}

const languageProvider = new Map<string, LanguageProvider>()

export function setLanguageServerEventHandler(handler: LanguageServerEventHandler) {
  languageServerEventHandler = handler
  for (const provider of languageProvider.values()) {
    installLanguageServerEventHandler(provider)
  }
}

export function installLanguageServerEventHandler(provider: LanguageProvider) {
  provider.onPublishDiagnostics(
    languageServerEventHandler.onPublishDiagnostics.bind(languageServerEventHandler)
  )
}

export function registerLanguageProvider(provider: LanguageProvider) {
  for (const key of provider.languageSupported) {
    languageProvider.set(key.languageKey, provider)
  }
  installLanguageServerEventHandler(provider)
}

export function getLanguageProvider(languageKey?: string) {
  if (!languageKey) return undefined
  return languageProvider.get(languageKey)
}

export function getLanguageProviderFromShortcut(shortcut?: string) {
  if (!shortcut) return undefined
  for (const provider of languageProvider.values()) {
    if (provider.languageSupported.some((lang) => lang.shortcut.includes(shortcut))) {
      return provider
    }
  }
  return undefined
}
