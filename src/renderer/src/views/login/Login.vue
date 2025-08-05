<template>
  <Header :show-max="false" :close-type="0"></Header>
  <div v-if="showLoading" class="login-panel">
    <img src="../../assets/img/loading.gif" />
    <div>正在登录...</div>
  </div>
  <div v-else class="login-form">
    <div class="error-msg">{{ errorMsg }}</div>
    <el-form ref="formDataRef" :model="formData" :rules="rules" label-width="0px" @submit.prevent>
      <!--input输入-->
      <el-form-item prop="email">
        <el-input v-model.trim="formData.email" clearable placeholder="请输入邮箱" size="large">
          <template #prefix>
            <span class="iconfont icon-email"></span>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item v-if="!isLogin" prop="nickName" size="large">
        <el-input
          v-model.trim="formData.nickName"
          clearable
          placeholder="请输入昵称"
          maxlength="20"
          size="large"
        >
          <template #prefix>
            <span class="iconfont icon-user-nick"></span>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model.trim="formData.password"
          clearable
          placeholder="请输入密码"
          show-password
          size="large"
          maxlength="18"
        >
          <template #prefix>
            <span class="iconfont icon-password"></span>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item v-if="!isLogin" prop="rePassword">
        <el-input
          v-model.trim="formData.rePassword"
          clearable
          placeholder="请重新输入密码"
          show-password
          size="large"
          maxlength="18"
        >
          <template #prefix>
            <span class="iconfont icon-password"></span>
          </template>
        </el-input>
      </el-form-item>
      <!--textarea输入-->

      <el-form-item prop="checkCode">
        <div class="check-code-panel">
          <el-input
            v-model.trim="formData.checkCode"
            clearable
            placeholder="请输入验证码"
            size="large"
          >
            <template #prefix>
              <span class="iconfont icon-checkcode"></span>
            </template>
          </el-input>
          <img :src="checkCodeUrl" class="check-code" @click="changeCheckCode" />
        </div>
      </el-form-item>

      <el-form-item prop="">
        <el-button type="primary" class="login-btn" size="large" @click="loginOrRegisterSubmit">{{
          isLogin ? '登录' : '注册'
        }}</el-button>
      </el-form-item>
      <div class="bottom-link">
        <span class="a-link no-account" @click="chageOpType">
          {{ isLogin ? '去注册' : '去登陆' }}</span
        >
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
const { proxy } = getCurrentInstance()
import { useRoute, useRouter } from 'vue-router'
import md5 from 'js-md5'
const route = useRoute()
const router = useRouter()
import { useUserInfoStore } from '@/store/UserInfoStore'
const userInfoStore = useUserInfoStore()
const isLogin = ref(true)
const showLoading = ref(false)
const formData = ref({
  email: 'test01@qq.com',
  password: 'Abc123456'
})
const formDataRef = ref()
const rules = {}
const salt = 'easymetting'

const errorMsg = ref()
const checkCodeUrl = ref(null)
const changeCheckCode = async () => {
  // console.log('api', proxy.Api.checkCode)
  let result = await proxy.Request({
    url: proxy.Api.checkCode
  })
  if (!result) {
    return
  }
  checkCodeUrl.value = result.data.checkCode
  localStorage.setItem('checkCodeKey', result.data.checkCodeKey)
}

const chageOpType = async () => {
  await window.electron.ipcRenderer.invoke('loginOrRegister', !isLogin.value)
  isLogin.value = !isLogin.value
  nextTick(() => {
    formDataRef.value.resetFields()
    formData.value = {}
    changeCheckCode()
    clearErrorMsg()
  })
}

const clearErrorMsg = () => {
  errorMsg.value = ''
}

const checkValue = (type, value, msg) => {
  // debugger
  if (proxy.Utils.isEmpty(value)) {
    errorMsg.value = msg
    return false
  }
  if (type && !proxy.Verify[type](value)) {
    errorMsg.value = msg
    return false
  }
  return true
}
const loginOrRegisterSubmit = async () => {
  clearErrorMsg()
  if (!checkValue('checkEmail', formData.value.email, '请输入正确的邮箱')) {
    return
  }

  if (!isLogin.value && !checkValue(null, formData.value.nickName, '请输入昵称')) {
    return
  }

  if (!checkValue('checkPassword', formData.value.password, '密码只能是数字,字母,特殊字符8~18位')) {
    return
  }

  if (!checkValue(null, formData.value.checkCode, '请输入验证码')) {
    return
  }

  if (!isLogin.value && !checkValue(null, formData.value.rePassword, '请再次输入密码')) {
    return
  }

  if (!isLogin.value && formData.value.password !== formData.value.rePassword) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }
  if (isLogin.value) {
    showLoading.value = true
  }

  // console.log('formData.value', formData.value)
  // console.log('salt', salt)
  // console.log('md5', md5(formData.value.password + salt))

  let result = await proxy.Request({
    url: isLogin.value ? proxy.Api.login : proxy.Api.register,
    showError: false,
    showLoading: false,
    params: {
      email: formData.value.email,
      password: isLogin.value ? md5(formData.value.password + salt) : formData.value.password,
      checkCode: formData.value.checkCode,
      checkCodeKey: localStorage.getItem('checkCodeKey'),
      nickName: isLogin.value ? '' : formData.value.nickName
    },
    errorCallback: (error) => {
      showLoading.value = false
      changeCheckCode()
      errorMsg.value = error.message
    }
  })
  if (!result) {
    return
  }
  // console.log('result', result)

  if (isLogin.value) {
    setTimeout(async () => {
      await window.electron.ipcRenderer.invoke('loginSuccess', {
        userInfo: result.data,
        wsUrl: import.meta.env.VITE_WS
      })
      userInfoStore.setInfo(result.data)
      // localStorage.setItem('userInfo', JSON.stringify(result.data))
      router.push('/home')
    }, 1500)
  } else {
    // console.log('isLogin', isLogin.value)
    proxy.Message.success('注册成功，请登录')
    chageOpType()
  }
}

changeCheckCode()
</script>

<style lang="scss" scoped>
.title {
  height: 30px;
  -webkit-app-regoin: drag;
}

.email-select {
  width: 250px;
}

.loading-panel {
  height: calc(100vh - 32px);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  font-size: 14px;
  color: #727272;

  img {
    width: 30px;
    margin-right: 3px;
  }
}

.login-form {
  padding: 0px 15px;
  height: calc(100vh - 32px);

  :deep(.el-input__wrapper) {
    box-shadow: none;
    border-radius: none;
  }

  .el-form-item {
    border-bottom: 1px solid #ddd;
  }
}

.email-panel {
  align-items: center;
  width: 100%;
  display: flex;

  .input {
    flex: 1;
  }

  .icon-down {
    margin-left: 3px;
    width: 16px;
    cursor: pointer;
    border: none;
  }
}

.error-msg {
  line-height: 30px;
  height: 30px;
  color: #fb7373;
}

.check-code-panel {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;

  .el-input {
    flex: 1;
    margin-right: 125px;
  }

  .check-code {
    cursor: pointer;
    width: 120px;
    height: 40px;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    flex-shrink: 0;
    object-fit: contain;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    min-width: 120px;
    min-height: 40px;
    max-width: 120px;
    max-height: 40px;
  }
}

.login-btn {
  margin-top: 20px;
  width: 100%;
}

.bottom-link {
  text-align: right;
  font-size: 13px;
}

.login-panel {
  /* 固定定位，让内容在视口范围内居中，覆盖整个视口区域 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* Flex 布局，使子元素在水平和垂直方向都居中 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* 让背景透明，可不设置 backgroundColor，或者设置 rgba 透明值，这里若想面板背景也透明可这样写：background-color: rgba(255, 255, 255, 0);  */
}

.login-panel img {
  /* 调整图片大小为 180px  square  */
  width: 240px;
  height: 240px;
  /* 与下方文字保持间距 */
  margin-bottom: 20px;
  /* 若图片本身有背景，可尝试去掉，不过一般 loading.gif 背景透明，这里主要是保证布局等 */
  background: transparent;
}

.login-panel div {
  /* 文字样式，可根据需求调整 */
  font-size: 16px;
  color: #333;
  /* 让文字也水平居中 */
  text-align: center;
}
.login-panel div {
  font-size: 16px;
  color: #333;
  text-align: center;
  /* 文字加载动画，模拟闪烁效果 */
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
