import * as hal from '@lib'
import { createLanguageClient } from '@lib/LanguageServer'
import StdioLS from '@lib/LanguageServer/ls/StdioLS'
import { exec } from '@lib/exec'
import log from 'electron-log/main.js'
import * as lsp from 'vscode-languageserver-protocol'
import { appconf } from '@lib/setting'
const clangdLog = log.scope('clangd')
const createClangd = () => ({
  ...createLanguageClient(StdioLS('clangd')),
  languageSupported: [
    {
      languageKey: 'cpp',
      shortcut: ['cpp', 'cxx', 'cc', 'c', 'h', 'hpp', 'hxx']
    }
  ],
  initializeResult: undefined as unknown as lsp.InitializeResult<unknown>,
  async compile(filename: string, execCmd?: string) {
    if (!execCmd) execCmd = appconf.LanguageProvicer.cpp.compileCommand
    return new Promise<hal.CompilerResult>((resolve) => {
      exec(
        `${execCmd} -o "${filename}".out "${filename}"`,
        {
          maxBuffer: appconf.CompilerOutputLimit
        },
        (error, stdout, stderr) => {
          if (stderr) clangdLog.error('compiler stderr:', stderr)
          if (error) clangdLog.error('compiler error:', error)
          resolve({
            code: error?.code || 0,
            stdout: stdout,
            outfilename: filename + '.out'
          })
        }
      )
    })
  },
  async run(filename: string, execArgs?: string, options?: hal.RunOptions) {
    return new Promise<hal.RunResult>((resolve) => {
      const timeout = options?.timelimit || appconf.ProgramTimeLimit
      let judgeResult: hal.JudgeResult = hal.JudgeResult.Accepted
      const _process = exec(
        `${filename} ${execArgs || ''}`,
        {
          maxBuffer: appconf.ProgramOutputLimit
        },
        (error, stdout, stderr) => {
          clearTimeout(timeoutEvent)
          if (error) clangdLog.error('run error:', error)
          resolve({
            judgeResult,
            code: error?.code || 0,
            stderr,
            output: stdout
          })
        }
      )
      const timeoutEvent = setTimeout(() => {
        judgeResult = hal.JudgeResult.TimeLimitExceeded
        _process.kill('SIGKILL')
      }, timeout * 1000)
      if (options?.input) {
        _process.stdin?.write(options.input)
        _process.stdin?.end()
      }
    })
  }
})
let clangd = createClangd()
clangd.listen()
const initializeResult = await clangd.initialize()
clangd = {
  ...clangd,
  initializeResult
}
await clangd.initialized()
await clangd.trace(lsp.Trace.Verbose, clangdLog)
hal.registerLanguageProvider(clangd)
