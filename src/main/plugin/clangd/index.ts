import * as hal from '../../../lib/lib'
import { createLanguageClient } from '../../../lib/LanguageServer'
import StdioLS from '../../../lib/LanguageServer/ls/StdioLS'
import log from 'electron-log/main.js'
import * as lsp from 'vscode-languageserver-protocol'
const lspClientLog = log.scope('lsp')
const createClangd = () => ({
  ...createLanguageClient(StdioLS('clangd')),
  languageSupported: [
    {
      languageKey: 'cpp',
      shortcut: ['cpp', 'cxx', 'cc', 'c', 'h', 'hpp', 'hxx']
    }
  ],
  initializeResult: undefined as unknown as lsp.InitializeResult<unknown>
})
let clangd = createClangd()
clangd.listen()
const initializeResult = await clangd.initialize()
clangd = {
  ...clangd,
  initializeResult
}
await clangd.initialized()
await clangd.trace(lsp.Trace.Verbose, lspClientLog)
hal.registerLanguageProvider(clangd)
