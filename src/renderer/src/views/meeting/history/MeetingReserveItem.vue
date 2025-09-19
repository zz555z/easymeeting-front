<template>
  <div v-if="!data.meetingName" class="reach-bottom">没有更多数据了</div>

  <div class="reserve-item" v-else>
    <!-- aa -{{ data.meetingName }} -->
    <div class="date-week">{{ proxy.Utils.getWeekAndDate(data.startTime) }}</div>
    <div class="meeting-info">
      <div class="time-line">
        <el-timeline>
          <el-timeline-item
            >{{ proxy.Utils.formatDate2(data.startTime, 'HH:mm') }}
          </el-timeline-item>
        </el-timeline>
      </div>

      <div class="meeting-user-panel">
        <div class="meeting-name">{{ data.meetingName }}</div>
        <div class="meeting-user">发起人 {{ data.nickName }} · {{ data.meetingId }}</div>
      </div>
      <div class="meeting-op">
        <div class="iconfont icon-close" @click="delMeetingRecord"></div>
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

const emit = defineEmits(['delRecrod'])
const delMeetingRecord = () => {
  proxy.Confirm({
    message: '确定要删除吗？',
    okfun: async () => {
      let result = await proxy.Request({
        url: proxy.Api.delMeetingReserve,
        params: {
          meetingId: props.data.meetingId
        }
      })
      if (!result) {
        return
      }
      emit('delRecrod', props.data.meetingId)
      // 通知主页面刷新预约的会议
      window.electron.ipcRenderer.send('windowCommunication', { windowId: 'main', data: 'reload' })
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
.reserve-item {
  margin: 10px 20px;
  background: #fff;
  border-radius: 5px;
  padding: 20px;
  &:hover {
    .meeting-info {
      .meeting-op {
        display: flex;
      }
    }
  }
  .date-week {
    text-align: left;
    font-size: 13px;
    color: #9e9e9e;
  }
  .meeting-info {
    margin-top: 10px;
    display: flex;
    .time-line {
      width: 100px;
      :deep {
        .el-timeline-item {
          padding-bottom: 10px;
        }
      }
    }
    .meeting-user-panel {
      flex: 1;
      .meeting-user {
        font-size: 13px;
        color: #666666;
        margin-top: 10px;
      }
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
      .icon-close {
        margin-right: 10px;
        font-weight: bold;
      }
    }
  }
}
</style>
