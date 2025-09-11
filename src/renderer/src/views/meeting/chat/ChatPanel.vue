<template>
  <div class="chat-panel">
    <div class="chat-panel-title">
      <div class="iconfont icon-liaotian">聊天</div>
    </div>
    <div class="chat-list" id="chat-list" ref="chatListRef">
      <MessageItem v-for="item in dateSource.list" :key="item.id" :message="item">
        <!-- {{ dateSource.list }} -->
      </MessageItem>
    </div>
    <ChatSend :sysSetting="sysSetting"></ChatSend>
  </div>
</template>

<script setup>
import ChatSend from './ChatSend.vue'
import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
import { useUserInfoStore } from '@/store/UserInfoStore'
const userInfoStore = useUserInfoStore()
import { useMeetingStore } from '@/store/MeetingStore'
import MessageItem from './MessageItem.vue'
const meetingStore = useMeetingStore()

const loading = ref(false)
const dateSource = ref({ list: [] })

const listenersMessage = () => {
  window.electron.ipcRenderer.on('chatMessage', async (e, data) => {
    console.log('chatMessage', data)

    data.isMe = data.sendUserId === userInfoStore.userInfo.userId
    dateSource.value.list.push(data)

    // console.log('dateSource.value.list', dateSource.value.list)
  })
}

const listenUploadProgress = () => {
  window.electron.ipcRenderer.on('uploadProgress', (e, { messageId, percent }) => {
    const message = dateSource.value.list.find((item) => {
      return item.messageId == messageId
    })
    if (!message) {
      return
    }
    message.uploadProgress = percent
  })
}

onMounted(() => {
  listenersMessage()
  listenUploadProgress()
})

onUnmounted(() => {
  window.electron.ipcRenderer.removeAllListeners('chatMessage')
  window.electron.ipcRenderer.removeAllListeners('uploadProgress')
})

const sysSetting = ref()
const loadSysSetting = async () => {
  let result = await proxy.Request({
    url: proxy.Api.getSysSetting,
    showLoading: false
  })
  if (!result) {
    return
  }
  // console.log('result', result)
  sysSetting.value = result.data
}
loadSysSetting()
</script>

<style lang="scss" scoped>
.chat-panel {
  height: calc(100vh - 300px);
  background: #fff;
  .chat-panel-title {
    border-bottom: 1px solid #ddd;
    padding: 10px;
    color: #4e5461;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .icon-chat {
      display: flex;
      align-items: center;
      font-size: 14px;
      &::before {
        margin-right: 3px;
        font-size: 20px;
      }
    }
    .icon-transfer {
      cursor: pointer;
    }
  }
  .chat-list {
    overflow: auto;
    height: calc(100vh - 345px);
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
  }
}
</style>
