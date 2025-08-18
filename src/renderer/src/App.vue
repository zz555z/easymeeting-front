<template>
  <el-config-provider :locale="zhCn">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from 'vue'

import { useUserInfoStore } from '@/store/UserInfoStore'
const userInfoStore = useUserInfoStore()

const saveUserInfo2Store = async () => {
  userInfoStore.setInfo(JSON.parse(localStorage.getItem('userInfo')) || {})
}

onMounted(() => {
  saveUserInfo2Store()
})
</script>

<style lang="scss" scoped></style>
