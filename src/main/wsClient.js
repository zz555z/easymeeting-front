import WebSocket from 'ws'
import { getWindow, getWindowManage } from './windowProxy'
let ws = null
const maxRetries = 5
let retryCount = 0
const HEARTBEAT_INTERVAL = 5000
const retryInterval = 2000

let heartBeatTimer = null
let wsUrl = null
let neetReconnect = null

const initWs = (_wsUrl) => {
  wsUrl = _wsUrl
  neetReconnect = true
  connectWs()
}

const wsCheck = () => {
  return import.meta.env.VITE_WS_CHECK === 'true'
}

const connectWs = () => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyStat === WebSocket.CONNECTING)) {
    console.log('已经连接上')
    return
  }
  console.log(`尝试连接....(重试次数:${retryCount}/${maxRetries}),连接地址:${wsUrl}`)
  ws = new WebSocket(wsUrl)
  ws.onopen = () => {
    if (retryCount > 0 && wsCheck) {
      const mainWindow = getWindow('main')
      mainWindow.webContents.send('reconnect', true)
    }
    retryCount = 0
    console.log('websocket连接成功')
    startHeartBeat()
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.log('收到消息:', data)
    // console.log('getWindowManage:', getWindowManage())
    const meetingWindow = getWindow('meeting')
    const mainWindow = getWindow('main')
    switch (data.messageType) {
      case 1: //加入房间
      case 2: //发送peer
      case 3: //退出房间
        if (mainWindow && (data.messageType == 1 || data.messageType == 3)) {
          mainWindow.webContents.send('meetingMessage', data)
        }
        if (meetingWindow) {
          meetingWindow.webContents.send('meetingMessage', data)
        }
        break
      case 11: //用户开启或关闭摄像头
        if (!meetingWindow) {
          return
        }
        meetingWindow.webContents.send('meetingMessage', data)
        break
      case 8: //好友申请
      case 12: //好友申请回复
        if (!mainWindow) {
          return
        }
        mainWindow.webContents.send('mainMessage', data)
        break
    }
  }
  ws.onerror = (error) => {
    // console.error('WebSocket error:', error)
    ws.close()
  }
  ws.onclose = (event) => {
    // console.log('WebSocket closed:', event)
    stopHeartBeat()
    reconnectWs()
  }
}

const reconnectWs = () => {
  if (!neetReconnect) {
    console.log('不需要重连')
    return
  }

  if (retryCount > maxRetries) {
    console.log('重试次数超过最大限制，停止重连')
    retryCount = 0
    if (wsCheck()) {
      logout(false)
    }
    return
  }
  retryCount++
  const delay = retryInterval * Math.pow(1.5, retryCount - 1)
  console.log(`等待 ${delay / 1000} 秒后尝试重新连接...`)
  if (wsCheck()) {
    const mainWindow = getWindow('main')
    mainWindow.webContents.send('reconnect', false)
  }
  setTimeout(() => {
    connectWs()
  }, delay)
}

const logout = (isNeedReconnect = true) => {
  const login_with = 375
  const login_height = 365
  const mainWindow = getWindow('main')
  mainWindow.setResizable(true)
  mainWindow.setMinimumSize(login_with, login_height)
  mainWindow.setSize(login_with, login_height)
  mainWindow.setResizable(false)
  if (isNeedReconnect) {
    neetReconnect = false
    ws.close()
  }
  const windowManage = getWindowManage()
  for (let key in windowManage) {
    const win = windowManage[key]
    if (key !== 'main') {
      win.close()
    }
  }
  mainWindow.webContents.send('logout')
}

const startHeartBeat = () => {
  heartBeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('ping')
    }
  }, HEARTBEAT_INTERVAL)
}

const stopHeartBeat = () => {
  clearInterval(heartBeatTimer)
  heartBeatTimer = null
}
const sendWsData = (data) => {
  if (!ws) {
    return
  }
  ws.send(data)
}

export { initWs, logout, sendWsData }
