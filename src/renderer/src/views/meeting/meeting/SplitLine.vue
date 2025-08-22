<template>
  <div class="line" @mousedown="startDrag">
    <div class="iconfont icon-split"></div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const props = defineProps({
  initWidth: {
    type: Number
  }
})

let isDragging = false
const startDrag = (e) => {
  isDragging = true
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

const emit = defineEmits(['widthChange'])
const onDrag = (e) => {
  if (!isDragging) {
    return
  }
  const windowWidth = window.innerWidth
  let newWidth = windowWidth - e.clientX
  if (newWidth > 600) {
    newWidth = 600
  } else if (newWidth < props.initWidth) {
    newWidth = props.initWidth
  }
  emit('widthChange', newWidth)
}
const stopDrag = () => {
  isDragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style lang="scss" scoped>
.line {
  cursor: w-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  width: 8px;
  background: #ededed;
  position: relative;
  .iconfont {
    font-size: 20px;
  }
}
</style>
