const windowManage = {}

const saveWindow = (id, window) => {
  windowManage[id] = window
}

const getWindow = (id) => {
  return windowManage[id]
}

const delWindow = (id) => {
  delete windowManage[id]
}

const getWindowManage = () => {
  return windowManage
}
// 根据value来获取key
const getKeyByValue = (value) => {
  return Object.keys(windowManage).find((key) => {
    return windowManage[key] === value
  })
}

export { saveWindow, getWindow, delWindow, getWindowManage, getKeyByValue }
