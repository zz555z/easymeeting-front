import { desktopCapturer, ipcMain, shell, dialog } from 'electron'
import { getWindow } from './windowProxy'
import { BrowserWindow } from 'electron/main'
import store from './store'
import { startRecording, stopRecording } from './recording'
import { initWs } from './wsClient'
import { getSysSetting, saveSysSetting } from './sysSetting'

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
        // console.log('data.closeType---->', data.closeType)
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
    store.initUserId(userInfo.userId)
    store.setData('userInfo', userInfo)
    initWs(wsUrl + userInfo.token)
    // store.initUserId(userInfo.userId)
    // store.setData('userInfo', userInfo)
    // initWs(wsUrl + userInfo.token)
  })
}

const onGetScreenSource = () => {
  ipcMain.handle('getScreenSource', async (event, opts) => {
    const sources = await desktopCapturer.getSources(opts)
    // console.log('sources--->', sources)
    return sources
      .filter((source) => {
        const size = source.thumbnail.getSize()
        return size.width > 10 && size.height > 10
      })
      .map((source, index) => ({
        id: source.id,
        name: source.name,
        displayId: source.display_id,
        // displayId: source.id,

        thumbnail: source.thumbnail.toDataURL()
      }))
  })
}

const onStartRecording = () => {
  ipcMain.handle('startRecording', (e, { displayId, mic }) => {
    const sender = e.sender
    startRecording(sender, displayId, mic)
  })
}

const onStopRecording = () => {
  ipcMain.handle('stopRecording', () => {
    stopRecording()
  })
}

const onOpenLocalFile = () => {
  ipcMain.on('openLocalFile', (e, { localFilePath, folder = false }) => {
    if (folder) {
      shell.openPath(localFilePath)
    } else {
      shell.showItemInFolder(localFilePath)
    }
  })
}

const onSaveSysSetting = () => {
  ipcMain.handle('saveSysSetting', (e, sysSetting) => {
    saveSysSetting(sysSetting)
  })
}

const onGetSysSetting = () => {
  ipcMain.handle('getSysSetting', (e, sysSetting) => {
    return getSysSetting()
  })
}

const onChangeLocalFolder = () => {
  ipcMain.handle('changeLocalFolder', async (e, { localFilePath }) => {
    const option = {
      properties: ['openDirectory'],
      defaultPath: localFilePath
    }
    let result = await dialog.showOpenDialog(option)

    if (result.canceled) {
      return
    }
    return result.filePaths[0].replaceAll('//', '\\\\')
  })
}

export {
  onLoginOrRegister,
  onWinTitleOp,
  onLoginSuccess,
  onGetScreenSource,
  onStartRecording,
  onStopRecording,
  onOpenLocalFile,
  onSaveSysSetting,
  onGetSysSetting,
  onChangeLocalFolder
}
