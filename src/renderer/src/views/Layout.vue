<template>
  <div class="layout">
    <div class="left">
      <div class="top-panel">
        <div class="avatar">
          <Avatar
            ref="avatarRef"
            :width="30"
            :avatar="userInfoStore.userInfo.userId"
            :update="true"
            @click="showUserInfo"
          >
          </Avatar>
        </div>
        <div class="top-menus">
          <div
            :class="['menu-item', item.codes.includes(route.meta.code) ? 'active' : '']"
            v-for="item in leftTopMenus"
            :key="item.name"
            @click="jumpMenu(item)"
          >
            <!-- {{ item.codes.includes(route.meta.code) }} -->
            <el-badge
              :value="item.messageCount"
              :max="99"
              :hidden="item.messageCount == 0"
              :offset="[-5, 0]"
            >
              <div :class="['iconfont', 'icon-' + item.icon]"></div>
              <div class="name">{{ item.name }}</div>
            </el-badge>
          </div>
        </div>
      </div>
      <div class="bottom-menus">
        <template v-for="item in leftBottomMenus">
          <div
            :class="['menu-item', item.codes.includes(route.meta.code) ? 'active' : '']"
            v-if="!item.onlyAdmin || (item.onlyAdmin && userInfoStore.userInfo.admin)"
            :key="item.name"
            @click="jumpMenu(item)"
          >
            <div :class="['iconfont', 'icon-' + item.icon]"></div>
          </div>
        </template>
      </div>
    </div>
    <div class="right">
      <router-view></router-view>
    </div>
  </div>
  <UpdateUser ref="updateUserRef" @reloadInfo="reloadInfoHandler"></UpdateUser>
</template>

<script setup>
import UpdateUser from './UpdateUser.vue'
import { ref, reactive, getCurrentInstance, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
import { useUserInfoStore } from '@/store/UserInfoStore'
const userInfoStore = useUserInfoStore()
import { useContactStore } from '@/store/UserContactStore'
const contactStore = useContactStore()
import { useMeetingStore } from '@/store/MeetingStore'
const meetingStore = useMeetingStore()
import { mitter } from '@/eventbus/eventBus.js'

// 顶部左侧菜单数据，使用 ref 做响应式处理
const leftTopMenus = ref([
  {
    name: '会议',
    icon: 'huiyi',
    path: '/meetingMain',
    codes: ['meeting'],
    messageCount: 0
  },
  {
    name: '通讯录',
    icon: '31haoyou',
    path: '/contact',
    codes: ['contact'],
    messageCount: 0
  },
  {
    name: '录制',
    icon: 'luzhi',
    path: '/screencap',
    codes: ['screencap'],
    messageCount: 0
  }
])

// 底部左侧菜单数据，普通数组
const leftBottomMenus = [
  {
    icon: 'shezhi',
    path: '/setting',
    codes: ['setting'],
    onlyAdmin: false
  },
  {
    icon: 'super_admin',
    codes: [],
    btnType: 'admin',
    onlyAdmin: true
  }
]

const jumpMenu = (menus) => {
  if (menus.btnType === 'admin' && !userInfoStore.userInfo.admin) {
    proxy.$message.error('只有管理员可以访问此功能')
    return
  }
  router.push(menus.path)
}

const listenerMessage = () => {
  window.electron.ipcRenderer.on('mainMessage', (e, result) => {
    console.log('mainMessage', result)
    switch (result.messageType) {
      case 8: //好友申请
        contactStore.updateLastUpdateTime()
        break
      case 12: //好友申请回复
        let msg = ''
        if (result.messageContent == 1) {
          mitter.emit('reloadContact')
          msg = '已同意申请'
        } else if (result.status == 2) {
          msg = '已拒绝申请'
        } else if (result.status == 3) {
          msg = '已将你拉黑'
        }
        proxy.Alert(`[${result.sendUserNickName}${msg}]`)
        break
      case 1: //邀请入会
        const newMember = result.messageContent.meetingMemberDto
        if (newMember.userId === userInfoStore.userInfo.userId) {
          meetingStore.updateMeeting(true)
        }
        break
      case 3: //退出会议
        const { exitUserId, exitStatus } = JSON.parse(result.messageContent)
        console.log('退出会议', exitUserId, exitStatus)

        if ((exitStatus == 3 || exitStatus == 4) && exitUserId === userInfoStore.userInfo.userId) {
          proxy.Confirm({
            message: `你被管理员移出会议`,
            showCancelBtn: false
          })
        }

        if (
          (exitStatus == 3 || exitStatus == 4 || exitStatus == 2) &&
          exitUserId === userInfoStore.userInfo.userId
        ) {
          meetingStore.updateMeeting(false)
        }
        break
      case 9:
        if (meetingStore.inMeeting) {
          return
        }
        const { meetingName, meetingId, inviteUserName } = result.messageContent
        proxy.Confirm({
          message: `【${inviteUserName}】邀请你加入会议【${meetingName}】`,
          okText: '接受邀请',
          cancelText: '拒绝',
          okfun: () => {
            acceptInvite(meetingId)
          }
        })

        break

      default:
        console.log('未知消息类型', result)
        break
    }
  })

  const acceptInvite = async (meetingId) => {
    let result = await proxy.Request({
      url: proxy.Api.acceptInvite,
      params: {
        meetingId
      }
    })
    if (!result) {
      return
    }
    window.electron.ipcRenderer.send('openWindow', {
      title: '会议详情',
      windowId: 'meeting',
      path: '/meeting',
      width: 1310,
      height: 800,
      maximizable: true
    })
  }

  const loadContactApplyCount = async () => {
    let result = await proxy.Request({
      url: proxy.Api.loadContactApplyDealWithCount
    })
    if (!result) {
      return
    }
    leftTopMenus.value[1].messageCount = result.data
  }

  watch(
    () => contactStore.lastUpdateTime,
    (newVal, oldVal) => {
      if (!newVal) {
        return
      }
      loadContactApplyCount()
    },
    { immediate: true, deep: true }
  )
}

const updateUserRef = ref()
const showUserInfo = () => {
  updateUserRef.value.show()
}

const avatarRef = ref()
const reloadInfoHandler = (date) => {
  userInfoStore.setInfo(date)
  avatarRef.value.updateAvatar()
}

onMounted(() => {
  listenerMessage()
})

onUnmounted(() => {
  window.electron.ipcRenderer.removeAllListeners('mainMessage')
})
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  position: relative;
  z-index: 1;
  // :deep(.el-overlay),
  // :deep(.el-message-box__wrapper),
  // :deep(.el-message-box) {
  //   -webkit-app-region: no-drag !important;
  //   z-index: 99999 !important;
  // }

  .left {
    width: 64px;
    background: #f3f3f4;
    margin: 0px auto;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    // -webkit-app-region: drag;

    .top-panel {
      text-align: center;
      -webkit-app-region: drag;

      .avatar {
        display: flex;
        justify-content: center;
        -webkit-app-region: no-drag;
        margin: 40px 0px 20px 0px;
      }
    }

    .top-menus {
      .menu-item {
        margin-bottom: 30px; // 增加间距
        text-align: center;
        cursor: pointer; // 鼠标样式
        -webkit-app-region: no-drag; // 允许点击

        // ...existing code...
        .iconfont {
          font-size: 20px; // 字体更小
        }

        .name {
          margin-top: 5px;
          font-size: 12px;
        }
      }
      .menu-item:last-child {
        margin-bottom: 0; // 最后一个不加间距
      }
      .menu-item.active {
        .iconfont {
          color: var(--blue);
        }
        .name {
          color: var(--blue);
        }
      }
    }

    .bottom-menus {
      margin-bottom: 30px;

      .menu-item {
        text-align: center;
        -webkit-app-region: no-drag;
        cursor: pointer;
        margin-bottom: 20px;
        color: #4c5262;

        .iconfont {
          font-size: 20px;
        }

        .name {
          margin-top: 5px;
          font-size: 12px;
        }

        &:hover {
          color: #353535;
        }

        &:last-child {
          margin-bottom: 0px;
        }

        .active {
          .iconfont {
            color: var(--blue);
          }

          .name {
            color: var(--blue);
          }
        }
      }
    }
  }

  .right {
    flex: 1;
    width: 0;
    height: calc(100vh);
  }
}
</style>

<!-- <style lang="scss">
.el-overlay,
.el-message-box__wrapper,
.el-message-box {
  -webkit-app-region: no-drag !important;
  z-index: 99999 !important;
}
</style> -->
