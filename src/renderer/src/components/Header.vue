<template>
  <div class="header" :style="{ 'border-bottom': showBottomBorder ? '1px solid #ddd' : 'none' }">
    <div class="title" v-if="title">{{ title }}</div>
    <TitleBar :closeType="closeType" :showMax="showMax"></TitleBar>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const props = defineProps({
  title: {
    type: String
  },
  showBottomBorder: {
    type: Boolean,
    default: false
  },

  showMax: {
    type: Boolean,
    default: true
  },

  closeType: {
    type: Number,
    default: 1 // 0: 关闭应用, 1: 隐藏窗口
  }
})
</script>

<style lang="scss" scoped>
.header {
  height: 30px;
  -webkit-app-region: drag;
  text-align: center;
  padding-top: 5px;
}
</style>
