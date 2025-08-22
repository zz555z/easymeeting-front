<template>
  <Dialog
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="640px"
    :showCancel="false"
    @close="dialogConfig.show = false"
  >
    <div class="screen-source-list">
      <div
        :class="['source-item', screenSource?.displayId === item.displayId ? 'active' : '']"
        v-for="item in screenSources"
        @click="selectSource(item)"
        :key="item.id"
      >
        <Cover :width="125" :scale="0.6" :source="item.thumbnail" borderRadius="0px"></Cover>
        <div class="name">{{ item.name }}</div>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { mitter } from '@/eventbus/eventBus.js'
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const dialogConfig = ref({
  show: false,
  title: '共享',
  buttons: [
    {
      type: 'primary',
      text: '开始共享',
      click: (e) => {
        submitForm()
      }
    }
  ]
})

const screenSources = ref([])
const show = () => {
  dialogConfig.value.show = true
  nextTick(async () => {
    screenSources.value = await window.electron.ipcRenderer.invoke('getScreenSource', {
      types: ['screen'], // 同时显示屏幕和窗口
      thumbnailSize: {
        width: 640,
        height: 360
      }
    })
    screenSource.value = screenSources.value[0]
  })
}

const screenSource = ref()
const selectSource = async (source) => {
  screenSource.value = source
}
const emit = defineEmits(['shareScreen'])

const submitForm = () => {
  dialogConfig.value.show = false
  // console.log('submitForm', screenSource.value.id)
  mitter.emit('shareScreen', screenSource.value.id)
}

defineExpose({
  show
})
</script>

<style lang="scss" scoped>
.screen-source-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 10px;
  flex-wrap: wrap;
  .source-item {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 8px 10px;
    width: 145px;
    &:hover {
      border-color: var(--blue);
    }
    .name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
      margin-top: 2px;
    }
  }
  .active {
    background: var(--blue);
    border-color: var(--blue);
    .name {
      color: #fff;
    }
  }
}
</style>
