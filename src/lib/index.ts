import * as lsp from 'vscode-languageserver-protocol'
import type * as monaco from 'monaco-editor'
export interface User {
  userid: string
  username: string
  extra: object
}

export interface TestCase {
  _in: string
  ans: string
}

export interface ContestProblem {
  contestID: string
  contestProblemID: string
}

export interface ProblemMeta {
  creator: string
  problemid: string
  contestProblem?: ContestProblem
  problemName: string
}

export interface ProblemInfo extends ProblemMeta {
  discribe: string
  tests: TestCase[]
  ac: number
  submit: number
  status: JudgeResult
}

export class TimeInterval {
  constructor(
    public begin: Date,
    public end: Date
  ) {}
}

export interface ContestMeta {
  contestid: string
  contestName: string
}

export interface ContestInfo extends ContestMeta {
  contestInfo: string
  problems: ProblemMeta[]
  contestDuration: TimeInterval
}

export enum JudgeResult {
  Pending,
  PendingRejudge,
  Compiling,
  RunningJudging,
  Accepted,
  Unknown,
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
  page: number
}

export interface ContestFilter {
  name?: string
  tags?: string[]
  pageination?: Pagination
}

export interface ProblemFilter {
  name?: string
  tags?: string[]
  pageination?: Pagination
}

export interface OnlineJudger {
  name: string
  login(): Promise<User>
  getContestTags(): Promise<string[]>
  getProblemTags(): Promise<string[]>
  getContestList(options: ContestFilter): Promise<ContestMeta[]>
  getProblemList(options: ProblemFilter): Promise<ProblemMeta[]>
  getContestInfo(contestid: string): Promise<ContestInfo>
  getProblemInfo(problemid: string): Promise<ProblemInfo>
  getRank(contestid: string): UserRank[]
  getCommit(userid: string, options: Pagination): Submit[]
  whoami(): User | null
}

export interface OnlineJudgerProvider extends OnlineJudger {
  key: string
}

const onlineJudgerProviders = new Map<string, OnlineJudgerProvider>()

export function registerOnlineJudgerProvider(provider: OnlineJudgerProvider) {
  onlineJudgerProviders.set(provider.key, provider)
}

export type ListOnlineJudgerProviderResult = Map<string, string>

export function listOnlineJudgerProvider() {
  const t = new Map<string, string>()
  onlineJudgerProviders.forEach((value, key) => {
    t.set(key, value.name)
  })
  return t
}

export function getOnlineJudgerProvider(key: string) {
  return onlineJudgerProviders.get(key)
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
