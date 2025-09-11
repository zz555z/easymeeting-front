<template>
  <div class="file-panel">
    <div class="file-name" :title="message.fileName">{{ message.fileName }}</div>
    <div class="file-size">{{ proxy.Utils.size2Str(message.fileSize) }}</div>
    <div class="uploading" v-if="message.status === 0">
      <el-progress type="circle" :percentage="message.uploadProgress || 0" :width="80" />
    </div>

    <div v-if="message.downloadProgress !== null" class="progress">
      <div v-if="message.downloadProgress < 100" class="downloading">
        <span class="iconfont icon-bottom"></span>
        <el-progress :stroke-width="5" :percentage="message.downloadProgress" />
      </div>
      <div class="download-complete" v-else>
        <div class="iconfont icon-select-bold download-success">下载完成</div>
        <div class="iconfont icon-folder" title="打开" @click="openLocalFile"></div>
      </div>
    </div>
    <div class="iconfont icon-bottom download-link" @click="download" v-else>下载</div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
import { useUserInfoStore } from '@/store/UserInfoStore'
const userInfoStore = useUserInfoStore()
const props = defineProps({
  message: {
    type: Object,
    default: {}
  }
})
</script>

<style lang="scss" scoped>
.file-panel {
  margin-top: 5px;
  display: flex;
  padding: 15px 10px 10px 10px;
  background: #e2e2e2;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 200px;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  .file-name {
    font-size: 14px;
    overflow: hidden; /* 隐藏溢出内容（必要） */
    text-overflow: ellipsis; /* 超出显示省略号（兼容性） */
    white-space: nowrap;
  }
  .file-size {
    margin-top: 5px;
    font-size: 12px;
    color: #6e6e6e;
  }
  .uploading {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    :deep {
      .el-progress__text {
        color: #20a0ff;
      }
    }
  }
  .download-link {
    margin-top: 5px;
    text-align: right;
    font-size: 12px;
    color: var(--blue);
    cursor: pointer;
    &::before {
      font-size: 16px;
      margin-right: 2px;
    }
  }
  .progress {
    margin-top: 5px;
    .downloading {
      display: flex;
      align-items: center;
      .icon-bottom {
        margin-right: 5px;
        color: var(--blue);
      }
      :deep {
        .el-progress {
          flex: 1;
        }
        .el-progress__text {
          min-width: 20px;
        }
      }
    }
    .download-complete {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .download-success {
        color: green;
        font-size: 13px;
        display: flex;
        align-items: center;
        &::before {
          font-size: 16px;
          margin-right: 2px;
        }
      }
    }
    .icon-folder {
      font-size: 20px;
      cursor: pointer;
      color: var(--blue);
    }
  }
}
</style>
