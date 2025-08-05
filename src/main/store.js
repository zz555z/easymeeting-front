const Store = require('electron-store')
const store = new Store()
let userId = null
const initUserId = (_userId) => {
  userId = _userId
}
const setData = (key, value) => {
  store.set(userId + key, value)
}

const getData = (key) => {
  return store.get(userId + key)
}

const getUserId = () => {
  return userId
}
export default {
  initUserId,
  setData,
  getData,
  getUserId
}
