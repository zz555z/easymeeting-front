import axios from 'axios'
import { ElLoading } from 'element-plus'
import Message from '../utils/Message'
import router from '@/router'
const contentTypeForm = 'application/x-www-form-urlencoded;charset=UTF-8'
const contentTypeJson = 'application/json'
const responseTypeJson = 'json'
let loading = null
const instance = axios.create({
  withCredentials: true,
  // dev域名为null会走代理转发
  baseURL: (import.meta.env.PROD ? import.meta.env.VITE_DOMAIN : '') + '/api',
  timeout: 10 * 1000
})

//请求前拦截器
instance.interceptors.request.use(
  (config) => {
    if (config.showLoading) {
      loading = ElLoading.service({
        lock: true,
        text: '加载中......',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }
    return config
  },
  (error) => {
    if (error.config.showLoading && loading) {
      loading.close()
    }
    Message.error('请求发送失败')
    return Promise.reject('请求发送失败')
  }
)
//请求后拦截器
instance.interceptors.response.use(
  async (response) => {
    const { showLoading, errorCallback, showError = true, responseType } = response.config
    if (showLoading && loading) {
      loading.close()
    }
    const responseData = response.data
    if (responseType == 'arraybuffer' || responseType == 'blob') {
      return responseData
    }
    //正常请求
    if (responseData.code == 200) {
      return responseData
    } else if (responseData.code == 901) {
      await window.electron.ipcRenderer.invoke('logout')
      router.push('/')
      return Promise.reject({ showError: false })
    } else {
      //其他错误
      if (errorCallback) {
        errorCallback(responseData)
      }
      return Promise.reject({ showError: showError, msg: responseData.message })
    }
  },
  (error) => {
    if (error.config.showLoading && loading) {
      loading.close()
    }
    return Promise.reject({ showError: true, msg: '网络异常' })
  }
)

const request = (config) => {
  const {
    url,
    params = {}, // 默认空对象，避免为null
    dataType,
    showLoading = true,
    responseType = responseTypeJson,
    showError = true
  } = config
  // console.log('request', config)

  let headers = {
    'X-Requested-With': 'XMLHttpRequest',
    token: (() => {
      let userInfoJson = localStorage.getItem('userInfo')
      return userInfoJson ? JSON.parse(userInfoJson).token : ''
    })()
  }

  let postData = params
  // 判断是否有文件类型
  const hasFile =
    params &&
    typeof params === 'object' &&
    Object.values(params).some((v) => v instanceof File || v instanceof Blob)
  if (hasFile) {
    let formData = new FormData()
    for (let key in params) {
      formData.append(key, params[key] == undefined ? '' : params[key])
    }
    postData = formData
    // 不要手动设置 Content-Type，axios 会自动处理
  } else if (dataType === 'json') {
    headers['Content-Type'] = contentTypeJson
    postData = params
  } else {
    headers['Content-Type'] = contentTypeForm
    let formData = new FormData()
    for (let key in params) {
      formData.append(key, params[key] == undefined ? '' : params[key])
    }
    postData = formData
  }

  return instance
    .post(url, postData, {
      onUploadProgress: (event) => {
        if (config.uploadProgressCallback) {
          config.uploadProgressCallback(event)
        }
      },
      responseType: responseType,
      headers: headers,
      showLoading: showLoading,
      errorCallback: config.errorCallback,
      showError: showError
    })
    .catch((error) => {
      if (error.showError) {
        Message.error(error.msg)
      }
      return null
    })
}

export default request
