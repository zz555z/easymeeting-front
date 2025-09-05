<template>
  <div class="footer">
    <div class="btn-list">
      <div class="btn-item" @click="micClickHandler">
        <MicIcon
          :defaultOpen="deviceInfo.micEnable && deviceInfo.micOpen"
          :size="20"
          :showLabel="false"
          v-model="micInfo"
          ref="micInfoRef"
        >
        </MicIcon>
        <div class="name">
          {{ deviceInfo.micEnable && deviceInfo.micOpen ? '静音' : '取消静音' }}
        </div>
      </div>
      <div class="btn-item" @click="cameraClickHandler">
        <div
          :class="[
            'iconfont',
            deviceInfo.cameraEnable && deviceInfo.cameraOpen ? 'icon-dkw_luzhi' : 'icon-guanbiluzhi'
          ]"
        ></div>
        <div class="name">
          {{ deviceInfo.cameraEnable && deviceInfo.cameraOpen ? '关闭视频' : '开启视频' }}
        </div>
      </div>
      <div class="btn-item" @click="shareScreenClickHandler">
        <div :class="['iconfont', shareScreen ? 'icon-close-bold' : 'icon-pingmugongxiang']"></div>
        <div class="name">{{ shareScreen ? '取消共享' : '共享屏幕' }}</div>
      </div>
      <div
        :class="['btn-item', item.active ? 'active' : '']"
        v-for="item in buttons"
        @click="clickHandler(item)"
        :key="item.btnType"
      >
        <el-badge
          :value="meetingStore.noReadChatCount"
          :max="99"
          :hidden="meetingStore.noReadChatCount == 0"
          :offset="[0, 3]"
          v-if="item.btnType === 'chat'"
        >
          <div :class="['iconfont', 'icon-' + item.icon]"></div>
          <div class="name">
            <span> {{ item.name }}</span>
          </div>
        </el-badge>
        <template v-else>
          <div :class="['iconfont', 'icon-' + item.icon]"></div>
          <div class="name">
            <span> {{ item.name }}</span>
            <span v-if="item.btnType == 'members'">({{ meetingStore.allMemberList.length }})</span>
          </div>
        </template>
      </div>
    </div>
  </div>
  <SelectScreen ref="selectScreenRef"></SelectScreen>
  <InviteMember ref="inviteMemberRef"></InviteMember>
</template>

<script setup>
import InviteMember from '../invite/InviteMember.vue'
import SelectScreen from './SelectScreen.vue'
import MicIcon from '@/components/MicIcon.vue'
import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMeetingStore } from '@/store/MeetingStore'
const meetingStore = useMeetingStore()
import { useUserInfoStore } from '@/store/UserInfoStore'
import { mitter } from '@/eventbus/eventBus.js'
const userInfoStore = useUserInfoStore()
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const props = defineProps({
  deviceInfo: {
    type: Object,
    default: {}
  }
})
const shareScreen = ref(route.query.addType == 1)
const micInfoRef = ref()
const micInfo = ref({})
const micClickHandler = () => {
  if (!props.deviceInfo.micEnable) {
    return
  }
  micInfoRef.value.toggleMic()
  props.deviceInfo.micOpen = !props.deviceInfo.micOpen
  mitter.emit('micSwith', props.deviceInfo.micOpen)
}

const cameraClickHandler = () => {
  if (!props.deviceInfo.cameraEnable) {
    return
  }
  props.deviceInfo.cameraOpen = !props.deviceInfo.cameraOpen
  mitter.emit('cameraSwith', props.deviceInfo.cameraOpen)
}

const selectScreenRef = ref()
const shareScreenClickHandler = () => {
  if (shareScreen.value) {
    mitter.emit('shareScreen', '')
    shareScreen.value = false
    return
  }
  selectScreenRef.value.show()
}

const inviteMemberRef = ref()
const clickHandler = (item) => {
  console.log(item)
  if (item.showActive) {
    buttons.value.forEach((btn) => {
      if (btn.btnType == item.btnType && !item.showActive) {
        btn.showActive = true
      } else {
        btn.showActive = false
      }
    })
  }
  switch (item.btnType) {
    case 'invite':
      inviteMemberRef.value.show()
      break
    case 'members':
      // shareScreenHandler()
      break
    case 'chat':
      // inviteMemberRef.value.show()
      break
  }
}

const shareScreenHandler = () => {
  shareScreen.value = true
}
onMounted(() => {
  mitter.on('shareScreen', shareScreenHandler)
})

onUnmounted(() => {
  mitter.off('shareScreen', shareScreenHandler)
})

const buttons = ref([
  {
    btnType: 'invite',
    name: '邀请',
    icon: 'tianjiayonghu'
  },
  {
    btnType: 'members',
    name: '成员',
    icon: 'huiyi',
    showActive: true,
    active: false
  },
  {
    btnType: 'chat',
    name: '聊天',
    icon: 'liaotian',
    showActive: true,
    active: false
  }
])
</script>

<style lang="scss" scoped>
.footer {
  -webkit-app-region: drag;
  border-top: 1px solid #ddd;
  height: 50px;
  display: flex;
  justify-content: center;
  .btn-list {
    display: flex;
    align-items: center;
    .btn-item {
      -webkit-app-region: no-drag;
      margin: 0px 5px;
      padding: 5px 0px;
      width: 70px;
      border-radius: 3px;
      cursor: pointer;
      color: var(--text);
      display: flex;
      flex-direction: column;
      align-items: center;
      &:hover {
        background: #efefef;
      }
      .iconfont {
        font-size: 20px;
      }
      .name {
        font-size: 12px;
      }
    }
    .close-screen-share {
      &:hover {
        background: #fff;
      }
    }
    .active {
      background: #efefef;
    }
  }
}
</style>
