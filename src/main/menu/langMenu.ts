import { Menu, MenuItemConstructorOptions, ipcMain } from 'electron'
ipcMain.handle('menu.langChoose', async () => {
  return new Promise((resolv, reject) => {
    const template = [
      {
        label: 'C/C++',
        accelerator: 'CmdOrCtrl+O',
        click: () => resolv('cpp')
      },
      {
        label: 'Python',
        accelerator: 'CmdOrCtrl+S',
        click: () => resolv('python')
      }
    ] as MenuItemConstructorOptions[]
    const menu = Menu.buildFromTemplate(template)
    menu.popup({
      callback: () => {
        reject()
      }
    })
  })
})
