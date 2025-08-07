<template>
  <div
    class="op-btns"
    :style="{
      top: `${styleTop}px`,
      right: `${styleRight}px`,
      'border-radius': `${borderRadius}px`
    }"
  >
    <div
      :style="{ 'border-radius': `${borderRadius}px` }"
      v-if="showMin"
      class="iconfont icon-minus-bold"
      @click="minimize()"
      title="最小化"
    ></div>

    <div
      :style="{ 'border-radius': `${borderRadius}px` }"
      v-if="showMax"
      :class="['iconfont', isMax ? 'icon-arrow-down-bold' : 'icon-rrow-up-bold']"
      :title="isMax ? '还原' : '最大化'"
      @click="maximize()"
    ></div>
    <div
      :style="{ 'border-radius': `${borderRadius}px` }"
      v-if="showClose"
      class="iconfont icon-close"
      title="关闭"
      @click="close()"
    ></div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const props = defineProps({
  showMin: {
    type: Boolean,
    default: true
  },
  showMax: {
    type: Boolean,
    default: false
  },
  showClose: {
    type: Boolean,
    default: true
  },
  closeType: {
    type: Number,
    default: 1 // 0: 关闭应用, 1: 隐藏窗口
  },
  styleTop: {
    type: Number,
    default: 0
  },
  styleRight: {
    type: Number,
    default: 0
  },
  borderRadius: {
    type: Number,
    default: 0
  },
  forceClose: {
    type: Boolean,
    default: true
  }
})

const isMax = ref(false)

const winOp = (action, data) => {
  window.electron.ipcRenderer.send('winTilteOp', { action, data })
}
// 关闭
const close = () => {
  winOp('close', { closeType: props.closeType, forceClose: props.forceClose })
}
const custClose = () => {
  winOp('close', { closeType: props.closeType, forceClose: true })
}
const minimize = () => {
  winOp('minimize')
}

const maximize = () => {
  // isMax.value = !isMax.value
  if (isMax.value) {
    winOp('unmaximize')
  } else {
    winOp('maximize')
  }
}

onMounted(() => {
  isMax.value = false
  window.electron.ipcRenderer.on('winIsMax', (e, result) => {
    // console.log('onwinIsMax', result)
    isMax.value = result
  })
})

defineExpose({
  custClose
})
</script>

<style lang="scss" scoped>
.op-btns {
  position: absolute;
  -webkit-app-region: no-drag;
  display: flex;
  .iconfont {
    color: var(--text);
    padding: 6px;
    cursor: pointer;
    &:hover {
      background: #ddd;
    }
  }
  .icon-close {
    &:hover {
      background: #fa4e32;
      color: #fff;
    }
  }
  .win-top {
    color: var(--pink);
  }
}
</style>
