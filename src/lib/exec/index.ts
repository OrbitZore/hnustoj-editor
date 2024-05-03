import * as child_process from 'child_process'
import { SpawnOptions, ExecOptions, ExecException } from 'child_process'
export function spawn(
  processpath: string,
  args?: string[],
  options: SpawnOptions = {
    stdio: ['pipe', 'pipe', process.stderr]
  }
) {
  const _process = child_process.spawn(processpath, args || [], options)
  return _process
}
export function exec(
  command: string,
  options: ExecOptions = {},
  callback?: (error: ExecException | null, stdout: string, stderr: string) => void
) {
  const _process = child_process.exec(command, options, callback)
  return _process
}
