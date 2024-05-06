import { IpcMainInvokeEvent, WebContents, ipcMain } from 'electron'
import log from 'electron-log/main.js'
const termLog = log.scope('terminal')
import { ptyspawn, ptySpawnResult } from '@lib/exec'
import { appconf } from '@lib/setting'

class Terminal {
  shells = new Map<
    number,
    {
      proc: ptySpawnResult
      handler: WebContents
    }
  >()
  async open(_event: IpcMainInvokeEvent) {
    const id = this.shells.size
    termLog.log('open', id)
    const proc = ptyspawn(appconf.Terminal.TerminalCommand, [], {
      env: {
        TERM: 'xterm-256color'
      }
    })
    const handler = _event.sender
    this.shells.set(this.shells.size, {
      proc,
      handler
    })
    proc.onData((data: string) => {
      handler.send('term.data', id, data)
    })
    return id
  }
  async stdin(_event: IpcMainInvokeEvent, id: number, data: string) {
    const shell = this.shells.get(id)
    if (!shell) return
    shell.proc.write(data)
  }
  async resize(_event: IpcMainInvokeEvent, id: number, columns: number, rows: number) {
    const shell = this.shells.get(id)
    if (!shell) return
    shell.proc.resize(columns, rows)
  }
  async close(_event: IpcMainInvokeEvent, id: number) {
    termLog.log('close', id)
    const shell = this.shells.get(id)
    if (!shell) return
    return new Promise((resolve) => {
      shell.proc.onExit(resolve)
      shell.proc.kill()
      this.shells.delete(id)
    })
  }
}
const terminal = new Terminal()
ipcMain.handle('term.open', terminal.open.bind(terminal))
ipcMain.handle('term.close', terminal.close.bind(terminal))
ipcMain.handle('term.stdin', terminal.stdin.bind(terminal))
ipcMain.handle('term.resize', terminal.resize.bind(terminal))
export default terminal
