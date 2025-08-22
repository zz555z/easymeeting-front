<template>
  <div>
    <Header>
      <TitleBar
        :showMax="true"
        :closeType="0"
        :styleTop="6"
        :styleRight="10"
        :borderRadius="5"
        :forceClose="false"
        ref="titleBarRef"
      ></TitleBar>
    </Header>
    <template v-if="inited">
      <div class="meeting-panel">
        <div :class="['layout', LAYOUT_CLASS[layoutType]]">
          <MemberList
            :deviceInfo="deviceInfo"
            @exitMeeting="forceMeeting"
            @selectMember="selectMemberHandler"
          ></MemberList>
          <div
            v-show="layoutType != 0"
            :class="['show-panel', transFormShowPanelVideo && !screenId ? 'transform-video' : '']"
            :style="{ height: `calc(100vh - ${(layoutType == 1 ? 123 : 0) + 90}px)` }"
          >
            <!-- {{ layoutType }} -->
            <video
              ref="centerScreenRef"
              autoplay
              playsinline
              loop
              muted
              v-show="openVideoRef"
            ></video>
            <div v-show="!openVideoRef" class="user-info">
              <Avatar :avatar="selectUserInfo.userId"></Avatar>
              <div :class="['user-name', 'iconfont', proxy.Utils.getSexIcon(selectUserInfo.sex)]">
                {{ selectUserInfo.nickName }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer :deviceInfo="deviceInfo"></Footer>
    </template>
    <template v-else>
      <div class="check-env">正在检查系统环境……</div>
    </template>
  </div>
</template>

<script setup>
import MemberList from './MemberList.vue'
import Footer from './Footer.vue'
import { mitter } from '@/eventbus/eventBus.js'
import Header from './Header.vue'
import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useUserInfoStore } from '@/store/UserInfoStore'
const userInfoStore = useUserInfoStore()
import { useMeetingStore } from '@/store/MeetingStore'
const meetingStore = useMeetingStore()
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const titleBarRef = ref()
const inited = ref(false)
const deviceInfo = ref({})

const screenId = ref()
const centerScreenRef = ref()
const transFormShowPanelVideo = ref(false)
const openVideoRef = ref(false)
const selectUserInfo = ref({})
const shareScreenHandler = (_screenId) => {
  screenId.value = _screenId
}

const selectMemberHandler = async ({ srcObject, userId, nickName, sex, videoOpen }) => {
  // if (layoutType.value == 0) {
  //   return
  // }
  selectUserInfo.value = {
    userId,
    nickName,
    sex
  }
  openVideoRef.value = videoOpen
  await nextTick()
  centerScreenRef.value.srcObject = srcObject
  if (userId == userInfoStore.userInfo.userId) {
    transFormShowPanelVideo.value = true
  } else {
    transFormShowPanelVideo.value = false
  }
}
const initEnv = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  const defaultMic = devices.find((device) => device.kind == 'audioinput')
  const sysSetting = await window.electron.ipcRenderer.invoke('getSysSetting')
  const stream = await navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false
    })
    .catch((error) => {
      console.error('获取摄像头失败', error)
    })
  deviceInfo.value = {
    micEnable: defaultMic != null,
    cameraEnable: stream != null,
    micOpen: sysSetting.openMic,
    cameraOpen: sysSetting.openCamera
  }
  inited.value = true
}
initEnv()
const LAYOUT_CLASS = {
  0: 'layout-grid-2_2',
  1: 'layout-top',
  2: 'layout-right'
}
const layoutType = ref(0)

const closeMeeting = () => {
  proxy.Confirm({
    title: '提示',
    message: '确定要退出会议吗？',
    okfun: () => {
      titleBarRef.value.custClose()
      // window.electron.ipcRenderer.send('closeWindow', 'meeting')
    }
  })
}

const forceMeeting = () => {
  titleBarRef.value.custClose()
}
const layoutChangeHandler = (type) => {
  console.log('meeting-layoutChangeHandler', type)
  layoutType.value = type
}

onMounted(() => {
  mitter.on('shareScreen', shareScreenHandler)
  mitter.on('layoutChange', layoutChangeHandler)
  window.electron.ipcRenderer.on('preCloseWindow', () => {
    closeMeeting()
  })
})

onUnmounted(() => {
  mitter.off('shareScreen', shareScreenHandler)
  mitter.off('layoutChange', layoutChangeHandler)
  window.electron.ipcRenderer.removeAllListeners('preCloseWindow')
})
</script>

<style lang="scss" scoped>
.meeting-panel {
  display: flex;
  .layout {
    flex: 1;
    height: calc(100vh - 92px);
    .show-panel {
      display: flex;
      align-items: center;
      justify-content: center;
      video {
        height: 100%;
        width: 100%;
        object-fit: contain;
      }
      .user-info {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        .user-name {
          margin-top: 5px;
          font-size: 13px;
          color: #575757;
          display: flex;
          align-items: center;
          &::before {
            color: var(--blue);
            margin-right: 1px;
            font-size: 16px;
          }
        }
        .icon-woman {
          &::before {
            color: #fb7373;
          }
        }
      }
    }

    .transform-video {
      video {
        transform: scaleX(-1);
      }
    }
  }
  .layout-top {
    margin: 0px auto;
    text-align: center;
    .show-panel {
      border-top: 1px solid #ddd;
    }
  }
  .layout-right {
    display: flex;
    flex-direction: row-reverse;
    .show-panel {
      border-right: 1px solid #ddd;
      flex: 1;
    }
  }
}
.check-env {
  height: calc(100vh - 42px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #797979;
}
</style>
