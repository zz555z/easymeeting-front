<template>
  <Header :showBottomBorder="false" :showMax="true"></Header>
  <div class="body-panel">
    <div class="part-title">常规设置</div>
    <div class="part-content">
      <div>
        <el-checkbox
          v-model="formData.openCamera"
          label="入会开启摄像头"
          size="large"
          @change="saveSetting"
        />
      </div>
      <div>
        <el-checkbox
          v-model="formData.openMic"
          label="入会开启麦克风"
          size="large"
          @change="saveSetting"
        />
      </div>
    </div>
    <div class="part-title">本地录制</div>
    <div class="cap-folder">
      <div>录制文件保存目录</div>
      <div class="folder">{{ formData.screencapFolder }}</div>
      <el-button type="primary" @click="changeLocalFolder">更改</el-button>
      <el-button type="success" @click="openLocalFolder">打开</el-button>
    </div>
    <div class="part-title">账号安全</div>
    <div class="part-content">
      <div class="part-item">
        <div class="part-tips">密码修改后，您需重新登录</div>
        <el-button type="primary" @click="updatePassword">修改密码</el-button>
      </div>
      <div class="part-item">
        <div class="part-tips">退出当前登录账号</div>
        <el-button type="primary" @click="logout">退出登录</el-button>
      </div>
    </div>
    <div class="part-title">版本更新</div>
    <div class="part-content">
      <div class="part-item">
        <div class="part-tips">更新版本</div>
        <el-button type="primary" @click="checkUpdate">检查更新</el-button>
      </div>
    </div>
  </div>
  <UpdatePassword ref="updatePasswordRef"></UpdatePassword>
  <AppUpdate :autoUpdate="false" ref="appUpdateRef"></AppUpdate>
</template>

<script setup>
import AppUpdate from './AppUpdate.vue'
import UpdatePassword from './UpdatePassword.vue'
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const formData = ref({
  screencapFolder: '/Users/zdd/.easymeeting'
})
const formDataRef = ref()
const rules = {
  title: [{ required: true, message: '请输入内容' }]
}

const getSysSetting = async () => {
  const sysSetting = await window.electron.ipcRenderer.invoke('getSysSetting')
  formData.value = sysSetting
}

const saveSetting = async () => {
  await window.electron.ipcRenderer.invoke('saveSysSetting', JSON.stringify(formData.value))
}

const changeLocalFolder = async () => {
  const folder = await window.electron.ipcRenderer.invoke('changeLocalFolder', {
    localFilePath: formData.value.screencapFolder.replaceAll('/', '\\')
  })
  if (folder) {
    formData.value.screencapFolder = folder.replaceAll('\\', '/')
    saveSetting()
  }
}

const openLocalFolder = () => {
  window.electron.ipcRenderer.send('openLocalFile', {
    localFilePath: formData.value.screencapFolder,
    folder: true
  })
}
// onChangeLocalFolder

const updatePasswordRef = ref()
const updatePassword = () => {
  updatePasswordRef.value.show()
}

const logout = () => {
  proxy.Confirm({
    message: '确定要退出吗?',
    okfun: async () => {
      let result = await proxy.Request({
        url: proxy.Api.logout
      })
      if (!result) {
        return
      }
      await window.electron.ipcRenderer.invoke('logout')
      router.push('/')
    }
  })
}

const appUpdateRef = ref()
const checkUpdate = () => {
  appUpdateRef.value.checkUpdate()
}

getSysSetting()
</script>

<style lang="scss" scoped>
.body-panel {
  height: calc(100vh - 32px);
  padding: 20px;
  .part-title {
    font-weight: bold;
    margin-top: 10px;
  }
  .cap-folder {
    display: flex;
    font-size: 14px;
    align-items: center;
    .folder {
      flex: 1;
      width: 0;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      padding: 3px;
      border: 1px solid #ddd;
      margin: 0px 10px;
    }
  }
  .part-content {
    .part-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 5px 0px;
      .part-tips {
        color: #535353;
        font-size: 14px;
      }
    }
  }
}
</style>
