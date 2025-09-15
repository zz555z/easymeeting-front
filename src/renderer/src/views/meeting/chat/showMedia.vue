<template>
  <div class="media-window">
    <div class="header">
      <div class="media-op no-drag">
        <div
          :class="['iconfont icon-arrow-left-bold', currentIndex == 0 ? 'not-allow' : '']"
          @dblclick.stop
          title="上一张"
          @click="next(-1)"
        ></div>
        <div
          :class="[
            'iconfont icon-arrow-right-bold',
            currentIndex >= allFileList.length - 1 ? 'not-allow' : ''
          ]"
          @dblclick.stop
          title="下一张"
          @click="next(1)"
        ></div>
        <template v-if="currentFile.fileType == 0">
          <el-divider direction="vertical" />
          <div
            class="iconfont icon-fangda"
            @click.stop="changeSize(0.1)"
            @dblclick.stop
            title="放大"
          ></div>
          <div
            class="iconfont icon-suoxiao"
            @click="changeSize(-0.1)"
            @dblclick.stop
            title="缩小"
          ></div>
          <div
            :class="['iconfont', isOne2One ? 'icon-zishiying' : 'icon-huanyuanhuabu']"
            @dblclick.stop
            @click="resize"
            :title="isOne2One ? '图片适应窗口大小' : '图片原始大小'"
          ></div>
          <div class="iconfont icon-xuanzhuan" @dblclick.stop @click="rotate" title="旋转"></div>
        </template>
        <div
          class="iconfont icon-lingcunwei"
          @dblclick.stop
          @click="download"
          title="另存为..."
        ></div>
      </div>
      <TitleBar :closeType="0" :styleTop="0" :styleRight="0" ref="titlebarRef"></TitleBar>
    </div>
    <div class="media-panel">
      <viewer
        :options="options"
        @inited="inited"
        :images="[currentFile.url]"
        v-if="currentFile.fileType == 0"
      >
        <img :src="currentFile.url" />
      </viewer>
      <Player v-show="currentFile.fileType == 1" ref="player"></Player>
    </div>
  </div>
</template>

<script setup>
import Player from '@/components/Player.vue'
import 'viewerjs/dist/viewer.css'
import { component as Viewer } from 'v-viewer'

import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const player = ref()
const currentIndex = ref(0)
const allFileList = ref([])
const currentFile = ref({})
const options = ref({
  inline: true,
  toolbar: false,
  navbar: false,
  button: false,
  title: false,
  zoomRatio: 0.1,
  zoomOnWheel: false
})

const viewerMy = ref(null)
const inited = (viewer) => {
  viewerMy.value = viewer
}

// 放大缩小
const changeSize = (zoomRatio) => {
  viewerMy.value.zoom(zoomRatio, true)
}
// 旋转
const rotate = () => {
  viewerMy.value.rotate(90, true)
}
// 原始大小
const isOne2One = ref(false)
const resize = () => {
  isOne2One.value = !isOne2One.value
  if (!isOne2One.value) {
    viewerMy.value.zoomTo(viewerMy.value.initialImageData.ratio, true)
  } else {
    viewerMy.value.zoomTo(1, true)
  }
}
const next = (index) => {
  if (currentIndex.value + index < 0 || currentIndex.value + index >= allFileList.value.length) {
    return
  }
  player.value.destroyPlayer()
  currentIndex.value = currentIndex.value + index
  getCurrentFile()
}

const onWheel = (e) => {
  if (e.deltaY < 0) {
    changeSize(0.1)
  } else {
    changeSize(-0.1)
  }
}

const getCurrentFile = () => {
  const curFile = allFileList.value[currentIndex.value]
  const url = proxy.Utils.getResroucePath(curFile)
  currentFile.value = { ...curFile, url }
  if (curFile.fileType == 1) {
    //TODO 视频播放
    player.value.showPlayer(url)
  }
}
onMounted(() => {
  window.addEventListener('wheel', onWheel)
  const { mediaList, currentMessageId } = route.query
  allFileList.value = JSON.parse(decodeURIComponent(mediaList))
  currentIndex.value = allFileList.value.findIndex((item) => {
    return item.messageId == currentMessageId
  })
  getCurrentFile()
})

const download = async () => {
  await window.electron.ipcRenderer.invoke('download', {
    url: import.meta.env.VITE_DOMAIN + proxy.Api.downloadFile,
    fileName: currentFile.value.fileName,
    messageId: currentFile.value.messageId,
    sendTime: currentFile.value.sendTime
  })
}

onUnmounted(() => {
  window.removeEventListener('wheel', onWheel)
})
</script>

<style lang="scss" scoped>
.media-window {
  padding: 0px;
  background: #fff;
  position: relative;
  overflow: hidden;
  .header {
    height: 30px;
    -webkit-app-region: drag;
    display: flex;
    .media-op {
      -webkit-app-region: no-drag;
      height: 100%;
      line-height: 30px;
      display: flex;
      align-items: center;
      .iconfont {
        font-size: 18px;
        padding: 0px 10px;
        &:hover {
          background: #f3f3f3;
          cursor: pointer;
        }
      }
      .not-allow {
        cursor: not-allowed;
        color: #ddd;
        text-decoration: none;
        &:hover {
          color: #ddd;
          cursor: not-allowed;
          background: none;
        }
      }
    }
  }
  .media-panel {
    height: calc(100vh - 32px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    :deep(.viewer-backdrop) {
      background: #f5f5f5;
    }

    .file-panel {
      .file-item {
        margin-top: 5px;
      }
      .donwload {
        margin-top: 20px;
        text-align: center;
      }
    }
  }
}
</style>
