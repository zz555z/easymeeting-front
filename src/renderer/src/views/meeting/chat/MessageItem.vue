<template>
  <div
    :class="[
      'message-item',
      message.isMe ? 'my-message' : '',
      isReceivedByMe ? 'received-message' : ''
    ]"
  >
    <Avatar :width="30" :avatar="message.sendUserId"></Avatar>
    <div class="message-content">
      <div class="nick-name">{{ message.sendUserNickName }}</div>
      <div class="message" v-if="message.messageType == 5">
        {{ message.messageContent }}
        <div class="direct"></div>
      </div>
      <MessageItemMadia
        v-if="message.messageType == 6 && (message.fileType == 0 || message.fileType == 1)"
        :message="message"
      ></MessageItemMadia>
      <MessageItemFile
        v-if="message.messageType == 6 && message.fileType == 2"
        :message="message"
      ></MessageItemFile>
    </div>
  </div>
</template>

<script setup>
import MessageItemFile from './MessageItemFile.vue'
import MessageItemMadia from './MessageItemMedia.vue'
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

const isReceivedByMe = computed(() => {
  return props.message.receiveUserId === userInfoStore.userInfo.userId
})
</script>

<style lang="scss" scoped>
.message-item {
  margin-top: 10px;
  display: flex;
  padding: 0px 15px;
  .message-content {
    margin-left: 10px;
    .nick-name {
      font-size: 12px;
      color: #5d5d5d;
      margin-right: 5px;
    }
    .message {
      margin-top: 3px;
      background: #f1f2f4;
      border-radius: 5px;
      padding: 5px 8px;
      font-size: 14px;
      width: fit-content;
      margin-right: 40px;
      position: relative;
      .direct {
        position: absolute;
        width: 8px;
        height: 8px;
        background: #f1f2f4;
        transform: rotate(45deg);
        top: 10px;
        left: -4px;
      }
    }
  }
}
.my-message {
  flex-direction: row-reverse;
  .message-content {
    margin-left: 0px;
    margin-right: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    .nick-name {
      margin-right: 0px;
      margin-left: 5px;
    }
    .message {
      background: #409eff;
      color: #fff;
      margin-left: 40px;
      margin-right: 0px;
      .direct {
        position: absolute;
        width: 8px;
        height: 8px;
        background: #409eff;
        transform: rotate(45deg);
        top: 10px;
        right: -4px;
        left: auto;
      }
    }
  }
}
.received-message .message-content .message {
  background: #800080;
  color: #fff;
}
.received-message .message-content .message .direct {
  background: #800080;
}
</style>
