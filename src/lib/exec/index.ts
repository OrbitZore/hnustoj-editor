import * as child_process from 'child_process'
import * as process from 'process'
import { SpawnOptions, ExecOptions, ExecException } from 'child_process'
import log from 'electron-log/main.js'
import * as pty from 'node-pty'
const execLog = log.scope('exec')
export type ptySpawnOptions = pty.IPtyForkOptions | pty.IWindowsPtyForkOptions
export type ptySpawnResult = pty.IPty
export function ptyspawn(processpath: string, args: string[] = [], options: ptySpawnOptions = {}) {
  const proc = pty.spawn(processpath, args, {
    ...options,
    env: {
      TERM: 'xterm-256color',
      ...options.env
    }
  })
  return proc
}
export function spawn(
  processpath: string,
  args: string[] = [],
  options: SpawnOptions = {
    stdio: ['pipe', 'pipe', process.stderr]
  }
) {
  const _process = child_process.spawn(processpath, args, options)
  return _process
}
export type spawnResult = child_process.ChildProcess
export function exec(
  command: string,
  options: ExecOptions = {},
  callback?: (error: ExecException | null, stdout: string, stderr: string) => void
) {
  execLog.log('exec', command, options)
  const _process = child_process.exec(command, options, callback)
  return _process
}
