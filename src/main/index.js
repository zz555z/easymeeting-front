import { app, shell, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import meetingIcon from '../../resources/icon-16x16.png?asset'
import icon from '../../resources/icon.png?asset'

import { saveWindow } from './windowProxy'
import {
  onLoginOrRegister,
  onWinTitleOp,
  onLoginSuccess,
  onGetScreenSource,
  onStartRecording,
  onStopRecording,
  onOpenLocalFile,
  onSaveSysSetting,
  onGetSysSetting,
  onChangeLocalFolder,
  onLogout,
  onOpenWindow,
  onSendPeerConnection
} from './ipc'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 375,
    height: 365,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    frame: false,
    transparent: false,
    maximizable: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  saveWindow('main', mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  const tray = new Tray(meetingIcon)
  const contextMenu = [
    {
      label: '退出',
      click: function () {
        app.quit()
      }
    }
  ]
  const menu = Menu.buildFromTemplate(contextMenu)
  tray.setToolTip('EasyMeeting')
  tray.setContextMenu(menu)
  tray.on('click', () => {
    mainWindow.setSkipTaskbar(false)
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('maximize', (event) => {
    mainWindow.webContents.send('winIsMax', true)
  })
  mainWindow.on('unmaximize', (event) => {
    mainWindow.webContents.send('winIsMax', false)
  })
  //监听窗口关闭事件
  mainWindow.on('closed', () => {
    // 销毁托盘图标
    if (tray) {
      tray.destroy()
    }
    // 退出应用
    app.quit()
  })
}

onLoginOrRegister()
onWinTitleOp()
onLoginSuccess()
onGetScreenSource()
onStartRecording()
onStopRecording()
onOpenLocalFile()
onSaveSysSetting()
onGetSysSetting()
onChangeLocalFolder()
onLogout()
onOpenWindow()
onSendPeerConnection()
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
