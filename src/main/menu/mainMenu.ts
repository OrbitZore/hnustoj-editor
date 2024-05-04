import { BrowserWindow, Menu, MenuItemConstructorOptions, dialog } from 'electron'
import log from 'electron-log/main.js'
const mainMenuLog = log.scope('mainmenu')
export default function buildMainMenu(window: BrowserWindow) {
  const template = [
    // { role: 'fileMenu' }
    {
      label: '文件',
      submenu: [
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(window, {
              title: '打开文件...',
              buttonLabel: '打开',
              properties: ['openFile']
            })
            if (result.canceled) return
            const filename = result.filePaths[0]
            mainMenuLog.log('open file:', filename)
            window.webContents.send('menu:open', filename)
          }
        },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => window.webContents.send('menu:save')
        }
      ]
    },
    // { label: 'editMenu' }
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          click: () => window.webContents.send('menu:revoke')
        },
        {
          label: '恢复',
          accelerator: 'CmdOrCtrl+Y',
          click: () => window.webContents.send('menu:restore')
        },
        { type: 'separator' },
        {
          label: '复制',
          accelerator: 'CmdOrCtrl+C',
          click: () => window.webContents.send('menu:copy')
        },
        {
          label: '粘贴',
          accelerator: 'CmdOrCtrl+V',
          click: () => window.webContents.send('menu:paste')
        },
        {
          label: '剪切',
          accelerator: 'CmdOrCtrl+X',
          click: () => window.webContents.send('menu:shear')
        },
        { type: 'separator' },
        {
          label: '全选',
          accelerator: 'CmdOrCtrl+A',
          click: () => window.webContents.send('menu:select-all')
        }
      ]
    },
    // { label: 'viewMenu' }
    {
      label: '视图',
      submenu: [
        {
          label: '切换侧边栏',
          accelerator: 'CmdOrCtrl+B',
          click: () => window.webContents.send('menu:toggleSidebar')
        },
        { type: 'separator' },
        {
          label: 'OJ管理器',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => window.webContents.send('menu:toggleOJManager')
        },
        {
          label: '比赛列表',
          accelerator: 'CmdOrCtrl+Shift+C',
          click: () => window.webContents.send('menu:toggleContestList')
        },
        {
          label: '题目列表',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => window.webContents.send('menu:toggleProblemList')
        },
        {
          label: '题目浏览器',
          accelerator: 'CmdOrCtrl+Shift+Q',
          click: () => window.webContents.send('menu:toggleProblemViewer')
        },
        {
          label: '版本管理器',
          accelerator: 'CmdOrCtrl+Shift+V',
          click: () => window.webContents.send('menu:toggleVersionCtrl')
        },
        {
          label: '调试器',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: () => window.webContents.send('menu:toggleDebugger')
        },
        {
          label: '统计',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => window.webContents.send('menu:toggleStatics')
        },
        { type: 'separator' }
        // {
        //   label: '扩展',
        //   accelerator: 'CmdOrCtrl+Shift+E',
        //   click: () => window.webContents.send('menu:toggleExtensions')
        // }
      ]
    },
    // { label: 'windowMenu' }
    {
      label: '运行',
      submenu: [
        {
          label: '编译并运行',
          accelerator: 'F11',
          click: () => window.webContents.send('menu:compile&run')
        },
        {
          label: '调试运行',
          accelerator: 'F12',
          click: () => window.webContents.send('menu:debugrun')
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于'
        }
      ]
    }
  ] as MenuItemConstructorOptions[]
  return Menu.buildFromTemplate(template)
}
