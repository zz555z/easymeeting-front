<template>
  <div class="media-panel" @click="showMediaHandler">
    <div class="uploading" v-if="message.status === 0">
      <img src="../../../assets/img/message-loading.gif" />
      <div class="info">正在上传中...</div>
    </div>
    <template v-else>
      <div class="play-btn" v-if="message.fileType === 1">
        <img src="../../../assets/img/play.webp" />
      </div>
      <div class="media-cover">
        <img :src="proxy.Utils.getResroucePath({ ...message, thumbnail: true })" fit="cover" />
      </div>
    </template>
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
.media-panel {
  margin-top: 3px;
  width: 200px;
  height: 130px;
  background: #ddd;
  border-radius: 5px;
  overflow: hidden;
  border-radius: 5px;
  cursor: pointer;
  position: relative;
  .uploading {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
    background: rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    img {
      width: 30px;
    }
    .info {
      font-size: 12px;
      color: #00a1d6;
    }
  }
  .play-btn {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    position: absolute;
    width: 100%;
    left: 0px;
    top: 0px;
    img {
      width: 30px;
      height: 30px;
    }
  }
  .media-cover {
    width: 100%;
    height: 100%;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
