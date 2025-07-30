<template>
  <Header :showMax="false" :closeType="0"></Header>
  <div class="login-panel" v-if="showLoading">
    <img src="../../assets/img/loading.gif" />
    <div>正在登录...</div>
  </div>
  <div class="login-form" v-else>
    <div class="error-msg">{{ errorMsg }}</div>
    <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="0px" @submit.prevent>
      <!--input输入-->
      <el-form-item prop="email">
        <el-input clearable placeholder="请输入邮箱" v-model.trim="formData.email" size="large">
          <template #prefix>
            <span class="iconfont icon-email"></span>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="nickName" v-if="!isLogin" size="large">
        <el-input
          clearable
          placeholder="请输入昵称"
          v-model.trim="formData.nickName"
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
          clearable
          placeholder="请输入密码"
          v-model.trim="formData.password"
          show-password
          size="large"
        >
          <template #prefix>
            <span class="iconfont icon-password"></span>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="rePassword" v-if="!isLogin">
        <el-input
          clearable
          placeholder="请重新输入密码"
          v-model.trim="formData.rePassword"
          show-password
          size="large"
        >
          <template #prefix>
            <span class="iconfont icon-password"></span>
          </template>
        </el-input>
      </el-form-item>
      <!--textarea输入-->

      <el-form-item prop="">
        <div class="check-code-panel">
          <el-input
            clearable
            placeholder="请输入验证码"
            v-model.trim="formData.checkcode"
            size="large"
          >
            <template #prefix>
              <span class="iconfont icon-checkcode"></span>
            </template>
          </el-input>
          <img src="https://picsum.photos/200/100" alt="" />
        </div>
      </el-form-item>

      <el-form-item prop="">
        <el-button type="primary" class="login-btn" size="large">{{
          isLogin ? '登录' : '注册'
        }}</el-button>
      </el-form-item>
      <div class="bottom-link">
        <span class="a-link no-account" @click="chageOpType">
          {{ isLogin ? '去注册?' : '去登陆?' }}</span
        >
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
const { proxy } = getCurrentInstance()
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const isLogin = ref(true)
const showLoading = ref(false)
const formData = ref({})
const formDataRef = ref()
const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  checkcode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const errorMsg = ref()

const chageOpType = async () => {
  isLogin.value = !isLogin.value
  await window.electron.ipcRenderer.invoke('loginOrRegister', isLogin.value)
}
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

  .check-code {
    cursor: pointer;
    width: 120px;
    margin-left: 5px;
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
</style>
