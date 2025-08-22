<template>
  <el-config-provider :locale="zhCn">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

import { useUserInfoStore } from '@/store/UserInfoStore'
const userInfoStore = useUserInfoStore()

const saveUserInfo2Store = async () => {
  userInfoStore.setInfo(JSON.parse(localStorage.getItem('userInfo')) || {})
}

const onExitMeeting = () => {
  window.electron.ipcRenderer.on('closeWindow', async (e, { windowId }) => {
    if (windowId === 'meeting') {
      await proxy.Request({
        url: proxy.Api.exitMeeting
      })
    }
  })
}
onMounted(() => {
  saveUserInfo2Store()
  onExitMeeting()
})
</script>

<style lang="scss" scoped></style>
