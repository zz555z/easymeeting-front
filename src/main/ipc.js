import { ipcMain } from 'electron'
import { getWindow } from './windowProxy'
import { BrowserWindow } from 'electron/main'

const onLoginOrRegister = () => {
  ipcMain.handle('loginOrRegister', (event, isLogin) => {
    const login_with = 375
    const login_height = 365
    const register_height = 485
    const mainWindow = getWindow('main')
    mainWindow.setResizable(true)
    mainWindow.setMinimumSize(login_with, login_height)
    if (isLogin) {
      mainWindow.setSize(login_with, login_height)
    } else {
      mainWindow.setSize(login_with, register_height)
    }
    mainWindow.setResizable(false)
  })
}

const onWinTitleOp = () => {
  ipcMain.on('winTilteOp', (e, { action, data }) => {
    console.log('当前动作：' + action)
    const webContents = e.sender
    const win = BrowserWindow.fromWebContents(webContents)
    switch (action) {
      case 'close':
        console.log('data.closeType---->', data.closeType)
        if (data.closeType == 0) {
          win.forceClose = data.forceClose
          win.close()
        } else {
          win.setSkipTaskbar(true)
          win.hide()
        }
        break
      case 'minimize': {
        win.minimize()
        break
      }
      case 'maximize': {
        win.maximize()
        break
      }
      case 'unmaximize': {
        win.unmaximize()
        break
      }
    }
  })
}

const onLoginSuccess = () => {
  ipcMain.handle('loginSuccess', (e, { userInfo, wsUrl }) => {
    const mainWindow = getWindow('main')
    mainWindow.setResizable(true)
    mainWindow.setMinimumSize(720, 480)
    mainWindow.setSize(720, 480)
    mainWindow.setResizable(false)
  })
}

export { onLoginOrRegister, onWinTitleOp, onLoginSuccess }
