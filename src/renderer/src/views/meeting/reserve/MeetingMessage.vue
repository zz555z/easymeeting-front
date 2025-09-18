<template>
  <Header
    :closeType="0"
    :showMax="false"
    :title="`会议【${route.query.meetName}】聊天记录`"
  ></Header>
  <div class="data-list">
    <DataLoadList
      ref="dataLoadingMoreRef"
      :loadMoreType="1"
      :dataSource="dataSource"
      :loading="loading"
      @loadData="loadMessage"
    >
      <template #default="{ data }">
        <MessageItem :message="data"></MessageItem>
      </template>
    </DataLoadList>
  </div>
</template>

<script setup>
import MessageItem from '../chat/MessageItem.vue'
import { ref, reactive, getCurrentInstance, nextTick, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
import { useUserInfoStore } from '@/store/UserInfoStore'
const userInfoStore = useUserInfoStore()
const loading = ref(false)
const dataSource = ref({})
const init = ref(false)
const dataLoadingMoreRef = ref()
const loadMessage = async () => {
  if (
    Object.keys(dataSource.value).length > 0 &&
    dataSource.value.pageNo == dataSource.value.pageTotal
  ) {
    return
  }
  loading.value = true
  let pageNo = dataSource.value.pageNo || 0
  pageNo++
  let result = await proxy.Request({
    url: proxy.Api.loadHistoryMessage,
    params: {
      pageNo,
      meetingId: route.query.meetingId
    }
  })
  if (!result) {
    return
  }
  loading.value = false
  const queryMessageList = result.data.list.map((item) => {
    item.isMe = userInfoStore.userInfo.userId == item.sendUserId
    return item
  })
  let list = dataSource.value.list || []
  list.unshift(...queryMessageList)
  result.data.list = list
  dataSource.value = result.data

  console.log('queryMessageList', dataSource.value)
  if (!init.value) {
    init.value = true
    await nextTick()
    dataLoadingMoreRef.value.gotoBottom(true)
  }
  if (dataSource.value.pageNo > 1) {
    await nextTick()
    dataLoadingMoreRef.value.gotoTop()
  }
}

provide('showMeadia', (messageId) => {
  let mediaList = dataSource.value.list
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
.data-list {
  height: calc(100vh - 32px);
  background: #fff;
}
</style>
