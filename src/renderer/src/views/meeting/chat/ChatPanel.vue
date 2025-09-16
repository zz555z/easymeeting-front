<template>
  <div class="chat-panel">
    <div class="chat-panel-title">
      <div class="iconfont icon-liaotian">聊天</div>
    </div>
    <div class="chat-list" id="chat-list" ref="chatListRef">
      <!-- <MessageItem v-for="item in dateSource.list" :key="item.id" :message="item"> </MessageItem> -->
      <DataLoadList
        ref="dataLoadListRef"
        :dataSource="dateSource"
        :loadMoreType="1"
        :loading="loading"
        @loadData="loadMessage"
      >
        <!-- <template #default="{ data, index }"> -->
        <template #default="{ data }">
          <MessageItem :message="data"> </MessageItem>
        </template>
      </DataLoadList>
    </div>
    <ChatSend :sysSetting="sysSetting"></ChatSend>
  </div>
</template>

<script setup>
import ChatSend from './ChatSend.vue'
import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
import { useUserInfoStore } from '@/store/UserInfoStore'
const userInfoStore = useUserInfoStore()
import { useMeetingStore } from '@/store/MeetingStore'
const meetingStore = useMeetingStore()
import MessageItem from './MessageItem.vue'

const loading = ref(false)
const dateSource = ref({})

const dataLoadListRef = ref()
const loadMessage = async () => {
  if (
    Object.keys(dateSource.value).length > 0 &&
    dateSource.value.pageNo == dateSource.value.pageTotal
  ) {
    return
  }
  loading.value = true
  let pageNo = dateSource.value.pageNo || 0
  pageNo++
  let result = await proxy.Request({
    url: proxy.Api.loadMessage,
    params: {
      pageNo,
      maxMessageId: pageNo > 1 ? dateSource.value.list[0].messageId : null
    }
  })
  if (!result || !result.data.list) {
    console.warn('请求返回数据异常:', result)

    return
  }
  loading.value = false

  const queryMessageList = result.data.list.map((item) => {
    item.isMe = userInfoStore.userInfo.userId == item.sendUserId
    return item
  })
  let list = dateSource.value.list || []
  list.unshift(...queryMessageList)
  result.data.list = list
  dateSource.value = result.data
  sortMessage()
  if (dateSource.value.pageNo > 1) {
    await nextTick()
    dataLoadListRef.value.gotoTop()
  }
}

const showChantPanel = async () => {
  await nextTick()
  dataLoadListRef.value.gotoBottom(true)
}

defineExpose({
  showChantPanel
})

const sortMessage = () => {
  dateSource.value.list.sort((a, b) => {
    return a.messageId - b.messageId
  })
}
const listenersMessage = () => {
  window.electron.ipcRenderer.on('chatMessage', async (e, data) => {
    console.log('chatMessage', data)
    switch (data.messageType) {
      case 5: //文本消息
      case 6: //媒体消息
        meetingStore.addNoReadChatCount()
        data.isMe = data.sendUserId === userInfoStore.userInfo.userId
        if (!dateSource.value.list) {
          dateSource.value.list = []
        }
        dateSource.value.list.push(data)
        sortMessage()
        await nextTick()
        dataLoadListRef.value.gotoBottom(true)
        // 滚动条到底部
        break
      case 7: //文件上传完成消息
        const messageItem = dateSource.value.list.find((item) => item.messageId === data.messageId)
        if (!messageItem) {
          return
        }
        messageItem.status = 1
        messageItem.messageContent = data.messageContent
        break
      default:
        console.log('未知消息类型', data)
        break
    }
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

const listenDownloadProgress = () => {
  window.electron.ipcRenderer.on('downloadProgress', (e, { messageId, percent, localFilePath }) => {
    const message = dateSource.value.list.find((item) => {
      return item.messageId == messageId
    })
    if (!message) {
      return
    }
    message.downloadProgress = percent
    message.localFilePath = localFilePath
  })
}

const sysSetting = ref()
const loadSysSetting = async () => {
  let result = await proxy.Request({
    url: proxy.Api.getSysSetting,
    showLoading: false
  })
  if (!result) {
    return
  }
  sysSetting.value = result.data
}
loadSysSetting()

onMounted(() => {
  listenersMessage()
  listenUploadProgress()
  listenDownloadProgress()
})

onUnmounted(() => {
  window.electron.ipcRenderer.removeAllListeners('chatMessage')
  window.electron.ipcRenderer.removeAllListeners('uploadProgress')
  window.electron.ipcRenderer.removeAllListeners('downloadProgress')
})

provide('showMeadia', (messageId) => {
  let mediaList = dateSource.value.list
    .filter((item) => {
      return item.status == 1 && (item.fileType == 0 || item.fileType == 1)
    })
    .map((item) => {
      return {
        messageId: item.messageId + '',
        fileType: item.fileType,
        sendTime: item.sendTime,
        fileName: item.fileName
      }
    })
  window.electron.ipcRenderer.send('openWindow', {
    title: '查看详情',
    windowId: 'media',
    path: '/showMedia',
    width: 960,
    height: 720,
    data: { currentMessageId: messageId, mediaList: JSON.stringify(mediaList) },
    maximizable: true
  })
})
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
