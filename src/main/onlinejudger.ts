import { IpcMainInvokeEvent, ipcMain } from 'electron'
import * as hal from './../lib/index'
class OnlineJudger {
  listOnlineJudgerProvider(_event: IpcMainInvokeEvent) {
    return hal.listOnlineJudgerProvider()
  }
  async login(_event: IpcMainInvokeEvent, key: string) {
    const provider = hal.getOnlineJudgerProvider(key)
    if (!provider) return
    const account = await provider.whoami()
    if (account) return account
    return provider.login()
  }
  async getContestTags(_event: IpcMainInvokeEvent) {
    const provider = hal.getOnlineJudgerProvider(key)
    if (!provider) return
    return provider.getContestTags()
  }
  async getContestList(_event: IpcMainInvokeEvent, key: string, options: hal.ContestFilter) {
    const provider = hal.getOnlineJudgerProvider(key)
    if (!provider) return
    return provider.getContestList(options)
  }
  async getContestInfo(_event: IpcMainInvokeEvent, key: string, contestid: string) {
    const provider = hal.getOnlineJudgerProvider(key)
    if (!provider) return
    return provider.getContestInfo(contestid)
  }
}

const oj = new OnlineJudger()
ipcMain.handle('oj.list', oj.listOnlineJudgerProvider.bind(oj))
ipcMain.handle('oj.getContestList', oj.getContestList.bind(oj))
ipcMain.handle('oj.getContestInfo', oj.getContestInfo.bind(oj))
ipcMain.handle('oj.getContestTags', oj.getContestTags.bind(oj))
ipcMain.handle('oj.login', oj.login.bind(oj))
export default oj
