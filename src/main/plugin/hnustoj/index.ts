import * as hal from '@lib'
import { BrowserWindow, Event, WebContentsWillRedirectEventParams, app, ipcMain } from 'electron'
import injectCSS from './inject.css?raw'
import injectJS from './inject?asset'
import log from 'electron-log/main.js'
import * as HNUSTURL from './hnustURL'
import { localStorage } from '@lib/storage'
import Queue from 'queue'
import { make_queue } from '@lib/queueWrapper'
import { is } from '@electron-toolkit/utils'

const hnustojLog = log.scope('hustoj')
class Account {
  constructor(
    public username: string,
    public password: string
  ) {}
}

class eventQueue extends Queue {
  constructor() {
    super({ concurrency: 1, autostart: true })
  }
}

ipcMain.on('hnustoj:sendAccount', (_e, user: Account) => {
  localStorage.safeSetItem('hnustoj:username', user.username)
  localStorage.safeSetItem('hnustoj:password', user.password)
})

const createHNUSTOJ = () =>
  make_queue({
    inlineBrowser: new BrowserWindow({
      show: false,
      webPreferences: {
        preload: injectJS,
        partition: 'persist:hnustoj'
      }
    }),
    queue: new eventQueue(),
    key: 'hnustoj',
    name: '湖南科技大学在线评测系统',
    async whoami() {
      hnustojLog.log('whoami')
      await this.inlineBrowser.loadURL(HNUSTURL.myinfo)
      return new Promise<hal.User | null>((resolv) => {
        ipcMain.once('hnustoj:sendUser', async (_e, user: hal.User | null) => {
          if (user) {
            hnustojLog.log('i am', user)
            resolv(user)
          } else {
            hnustojLog.log('not login')
            resolv(null)
          }
        })
        this.inlineBrowser.webContents.executeJavaScript('window.api.sendUser();')
      })
    },
    async login() {
      const user = new Account(
        await localStorage.safeGetItem('hnustoj:username'),
        await localStorage.safeGetItem('hnustoj:password')
      )
      hnustojLog.log(user)
      await this.inlineBrowser.loadURL(HNUSTURL.rootURL)
      await this.inlineBrowser.loadURL(HNUSTURL.loginPage)
      await this.inlineBrowser.webContents.insertCSS(injectCSS)
      if (user.username)
        await this.inlineBrowser.webContents.executeJavaScript(
          `document.forms['login']['user_id'].value="${user.username}";`
        )
      if (user.password)
        await this.inlineBrowser.webContents.executeJavaScript(
          `document.forms['login']['password'].value="${user.password}";`
        )
      await this.inlineBrowser.webContents.executeJavaScript('window.api.regSendAccount();')
      return new Promise<hal.User | null>((resolv) => {
        const WhenNavigate = async (event: Event<WebContentsWillRedirectEventParams>) => {
          hnustojLog.log('navigate:', event.url)
          if (HNUSTURL.URLEqual(event.url, HNUSTURL.rootURL)) {
            //登陆成功
            this.inlineBrowser.webContents.off('will-navigate', WhenNavigate)
            hnustojLog.log('login success')
            this.whoami().then((v) => {
              if (!is.dev) {
                this.inlineBrowser.hide()
              }
              resolv(v)
            })
          }
        }
        this.inlineBrowser.once('close', (e) => {
          e.preventDefault()
          this.inlineBrowser.webContents.off('will-navigate', WhenNavigate)
          this.inlineBrowser.hide()
          resolv(null)
        })
        this.inlineBrowser.webContents.on('will-navigate', WhenNavigate)
        this.inlineBrowser.show()
        //http://acm.hnust.cn/login.php
      })
    },
    async getContestInfo(contestid: string) {
      await this.inlineBrowser.loadURL(HNUSTURL.contestInfoPage(contestid))
      return new Promise<hal.ContestInfo>((resolv) => {
        ipcMain.once('hnustoj:sendContestInfo', async (_e, contestInfo: hal.ContestInfo) => {
          resolv(contestInfo)
        })
        this.inlineBrowser.webContents.executeJavaScript(
          `window.api.sendContestInfo(${contestid});`
        )
      })
    },
    async getContestList(options: hal.ContestFilter) {
      await this.inlineBrowser.loadURL(HNUSTURL.myImpartPage(options.pageination?.page))
      const search: string[] = []
      if (options.name) search.push(options.name)
      if (options.tags?.length) search.push(...options.tags)
      const searchString = search.join(' ').trim()
      const waitloaded = new Promise<void>((resolve) => {
        this.inlineBrowser.webContents.once('did-finish-load', () => {
          resolve()
        })
      })
      if (searchString) {
        await this.inlineBrowser.webContents.executeJavaScript(
          `document.forms[0]['keyword'].value="${searchString}";document.forms[0].submit();`
        )
        await waitloaded
      }
      return new Promise<hal.ContestMeta[]>((resolv) => {
        ipcMain.once(
          'hnustoj:sendContestList',
          async (_e, contestList: { id: string; name: string }[]) => {
            resolv(
              contestList.map(({ id, name }) => ({
                contestid: id,
                contestName: name
              }))
            )
          }
        )
        this.inlineBrowser.webContents.executeJavaScript(
          `window.api.sendContestList(${JSON.stringify(options)});`
        )
      })
    },
    async getContestTags() {
      return []
    },
    async getProblemTags() {
      await this.inlineBrowser.loadURL(HNUSTURL.problemTagPage)
      return new Promise((resolv) => {
        ipcMain.once('hnustoj:sendProblemTags', async (_e, problemTags: string[]) => {
          resolv(problemTags)
        })
        this.inlineBrowser.webContents.executeJavaScript(`window.api.sendProblemTags();`)
      })
    },
    async getProblemInfo(problemid: string) {
      await this.inlineBrowser.loadURL(HNUSTURL.problemInfoPage(problemid))
      return new Promise((resolv) => {
        ipcMain.once('hnustoj:sendProblemInfo', async (_e, problem: hal.ProblemInfo) => {
          resolv(problem)
        })
        this.inlineBrowser.webContents.executeJavaScript(`window.api.sendProblemInfo();`)
      })
    }
  })
app.whenReady().then(() => {
  const hnustoj = createHNUSTOJ()
  hal.registerOnlineJudgerProvider(hnustoj as unknown as hal.OnlineJudgerProvider)
})
