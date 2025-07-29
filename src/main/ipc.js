import { ipcMain } from 'electron'
import { getWindow } from './windowProxy'

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

export { onLoginOrRegister }
