<template>
  <div class="today-panel">
    <div class="cur-date">{{ proxy.Utils.formatDate2(new Date().getTime(), 'M月DD日') }}</div>
    <div class="history">
      <div class="china-date-day">
        {{ proxy.Utils.getChinaDateDay() }}
      </div>
      <div class="btn" @click="meetingHistory">
        全部会议<span class="iconfont icon-narrow-right"></span>
      </div>
    </div>
    <div class="today-meeting">
      <template v-if="Object.keys(currentMeeting).length > 0 || toadyMeetingList.length > 0">
        <div class="today">今天 {{ proxy.Utils.formatDate2(new Date().getTime(), 'M月DD日') }}</div>
        <div class="meeting-list">
          <div class="current-meeting" v-if="Object.keys(currentMeeting).length > 0">
            <div class="meeting-title-info">
              <div class="meeting-title">{{ currentMeeting.meetingName }}</div>
              <el-dropdown v-if="currentMeeting.createUserId === userInfoStore.userInfo.userId">
                <div class="iconfont icon-sangedian"></div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="finishMeeting">结束会议</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <div class="iconfont icon-lingcunwei" @click="shareMeeting"></div>
              <div class="join-status">已入会</div>
            </div>
            <div class="meeting-no">
              {{ proxy.Utils.formatMeetingNo(currentMeeting.meetingNo) }}
            </div>
            <div class="status-name">进行中</div>
          </div>
          <div v-for="item in toadyMeetingList" :key="item.meetingId" class="today-meeting-item">
            <div class="meeting-name">{{ item.meetingName }}</div>
            <div class="time-info-panel">
              <div class="time-info">
                <div>
                  {{ proxy.Utils.formatDate2(item.startTime, 'HH:mm') }}~{{
                    proxy.Utils.timeAddMin(item.startTime, item.duration)
                  }}
                </div>
                <div class="point">·</div>
                <div>{{ proxy.Utils.formatMeetingNo(item.meetingId) }}</div>
              </div>
              <div class="op-panel">
                <el-button type="danger" size="small" @click="delMeeting(item)">删除</el-button>
                <el-button type="primary" size="small" @click="joinMeeting(item)">入会</el-button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
  <MeetingShare ref="shareMeetingRef" />
</template>

<script setup>
import MeetingShare from '../meeting/history/MeetingShare.vue'
import { ref, reactive, getCurrentInstance, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
import { useMeetingStore } from '@/store/MeetingStore'
const meetingStore = useMeetingStore()
import { useUserInfoStore } from '@/store/UserInfoStore'
const userInfoStore = useUserInfoStore()

const currentMeeting = ref({})
const getCurrentMeeting = async () => {
  let result = await proxy.Request({
    url: proxy.Api.getCurrentMeeting
  })
  if (!result) {
    return
  }
  currentMeeting.value = result.data || {}
}

const shareMeetingRef = ref({})
const toadyMeetingList = ref([])

const shareMeeting = () => {
  shareMeetingRef.value.show(currentMeeting.value)
}
const loadTodayMeeting = async () => {
  let result = await proxy.Request({
    url: proxy.Api.loadTodayMeeting
  })
  if (!result) {
    return
  }
  toadyMeetingList.value = result.data.filter((item) => {
    return item.meetingId !== currentMeeting.value.meetingId
  })
}

const finishMeeting = () => {
  proxy.Confirm({
    message: '确定要结束会议',
    okfun: async () => {
      let result = await proxy.Request({
        url: proxy.Api.finishMeeting,
        params: {
          meetingId: currentMeeting.value.meetingId
        }
      })
      if (!result) {
        return
      }
      currentMeeting.value = {}
    }
  })
}

watch(
  () => meetingStore.lastUpdate,
  (newVal, oldVal) => {
    getCurrentMeeting()
  },
  { immediate: true, deep: true }
)
</script>

<style lang="scss" scoped>
.today-panel {
  padding-left: 20px;
  padding-top: 80px;

  .cur-date {
    font-size: 28px;
    font-weight: bold;
    text-align: left;
    width: 350px;
  }

  .history {
    -webkit-app-region: no-drag;
    border-bottom: 1px solid #e6e6e6;
    text-align: right;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;

    .china-date-day {
      font-size: 13px;
      color: #535353;
    }

    .btn {
      background: #f0f0f0;
      border-radius: 5px;
      font-size: 12px;
      padding: 2px 5px;
      color: #424242;
      cursor: pointer;

      .iconfont {
        font-size: 12px;
        color: #424242;
      }
    }
  }
  .today-meeting {
    -webkit-app-region: no-drag;

    .today {
      color: #5c5c5c;
      font-size: 13px;
      padding: 10px 0px 0px 0px;
    }

    .no-data {
      margin-top: 30px;
    }
    .meeting-list {
      height: calc(100vh - 182px);
      overflow: auto;
      padding-right: 10px;

      .current-meeting {
        margin-top: 20px;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        background: #ededed;

        &:hover {
          background: #e1e1e1;
        }

        .meeting-title-info {
          display: flex;
          align-items: center;

          .meeting-title {
            flex: 1;
            width: 0;
            font-size: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .iconfont {
            margin-right: 5px;
            background: #c2c2c2;
            border-radius: 5px;
            padding: 4px;
            color: #484848;
          }

          .join-status {
            color: var(--blue);
            font-size: 12px;
          }
        }

        .meeting-no {
          margin-top: 5px;
          font-size: 12px;
          color: #838383;
        }

        .status-name {
          color: var(--blue);
          font-size: 12px;
          margin-top: 3px;
        }
      }
      .today-meeting-item {
        margin-top: 10px;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;

        &:hover {
          background: #e1e1e1;

          .time-info-panel {
            .op-panel {
              display: block;
            }
          }
        }

        .meeting-name {
          font-size: 15px;
        }

        .time-info-panel {
          margin-top: 3px;
          display: flex;
          align-items: center;
          font-size: 12px;
          color: #6c6c6c;
          height: 28px;

          .time-info {
            flex: 1;
            display: flex;

            .point {
              margin: 0px 5px;
            }

            .tips {
              color: #ff7a15;
            }
          }

          .op-panel {
            display: none;
          }
        }
      }
    }
  }
}
</style>
