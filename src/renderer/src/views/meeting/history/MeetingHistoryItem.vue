<template>
  <div v-if="!data.meetingName" class="reach-bottom">没有更多数据了</div>

  <div class="history-item" v-else>
    <div class="date-week">{{ proxy.Utils.getWeekAndDate(data.startTime) }}</div>
    <div class="meeting-panel">
      <div class="time-panel">
        <div>{{ proxy.Utils.formatDate(data.startTime) }}</div>
        <div class="meeting-info">参会</div>
      </div>
      <div class="content-panel">
        <div class="meeting-name-panel">
          <div class="meeting-name">{{ data.meetingName }}</div>
          <div class="meeting-op">
            <div class="iconfont icon-close-bold" @click="delMeetingRecord"></div>
            <div class="iconfont icon-liaotian" @click="showMeetingMessage"></div>
          </div>
        </div>
        <div class="meeting-info">会议号: {{ data.meetingId }}</div>
        <div class="meeting-info">发起人: {{ data.createUserName }}</div>
        <div class="meeting-info">
          已参会:
          <span class="join-member" @click="showMeetingMember">
            共{{ data.memberCount }}人<span class="iconfont icon-narrow-right"></span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
import { useUserInfoStore } from '@/store/UserInfoStore'
const userInfoStore = useUserInfoStore()

const props = defineProps({
  data: {
    type: Object,
    default: {}
  }
})

const showMeetingMessage = () => {
  window.electron.ipcRenderer.send('openWindow', {
    title: '会议聊天记录',
    windowId: 'meetingMessage',
    path: '/meetingMessage',
    width: 600,
    height: 800,
    maximizable: false,
    data: {
      meetingId: props.data.meetingId,
      meetName: props.data.meetingName
    }
  })
}

const showMeetingMember = () => {
  window.electron.ipcRenderer.send('openWindow', {
    title: '会议成员',
    windowId: 'meetingMember',
    path: '/meetingMember',
    width: 500,
    height: 600,
    maximizable: false,
    data: {
      meetingId: props.data.meetingId,
      meetName: props.data.meetingName
    }
  })
}

const emit = defineEmits(['delRecrod'])
const delMeetingRecord = () => {
  proxy.Confirm({
    message: '确定要删除记录吗？',
    okfun: async () => {
      let result = await proxy.Request({
        url: proxy.Api.delMeetingRecord,
        params: {
          meetingId: props.data.meetingId
        }
      })
      if (!result) {
        return
      }
      emit('delRecrod', props.data.meetingId)
    }
  })
}
</script>

<style lang="scss" scoped>
.reach-bottom {
  text-align: center;
  line-height: 40px;
  color: var(--text2);
  font-size: 16px;
}
.history-item {
  margin: 10px 20px;
  background: #fff;
  border-radius: 5px;
  padding: 20px;
  &:hover {
    .meeting-panel {
      .content-panel {
        .meeting-name-panel {
          .meeting-op {
            display: flex;
          }
        }
      }
    }
  }
  .date-week {
    text-align: left;
    font-size: 13px;
    color: #9e9e9e;
  }
  .meeting-panel {
    margin-top: 10px;
    display: flex;
    .time-panel {
      font-size: 13px;
      color: #525252;
      padding-top: 2px;
      .meeting-info {
        font-size: 13px;
        color: #525252;
        margin-top: 5px;
      }
    }
    .content-panel {
      margin-left: 10px;
      flex: 1;
      text-align: left;
      .meeting-name-panel {
        font-size: 16px;
        display: flex;
        .meeting-name {
          height: 28px;
          width: 0;
          flex: 1;
        }
        .meeting-op {
          display: none;
          align-items: center;
          .iconfont {
            background: #efefef;
            padding: 5px;
            border-radius: 5px;
            color: #656565;
            cursor: pointer;
          }
          .icon-close-bold {
            margin-right: 10px;
            font-weight: bold;
          }
        }
      }
      .meeting-info {
        font-size: 13px;
        color: #525252;
        margin-top: 5px;
      }
      .join-member {
        margin-left: 5px;
        cursor: pointer;
        border-radius: 3px;
        padding: 2px;
        &:hover {
          background: #ddd;
        }
        .icon-narrow-right {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
