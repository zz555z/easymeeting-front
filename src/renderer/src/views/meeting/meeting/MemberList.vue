<template>
  <div :class="['member-list', LIST_MAP[layoutType]]" :style="gridStyle">
    <div
      :class="[
        'member-item',
        curentSelectId == userInfoStore.userInfo.userId ? 'active' : '',
        proxy.Utils.isEmpty(screenId) ? 'member-my' : '',
        LAOUT_MAP[layoutType]
      ]"
      @click="
        selectMember(
          userInfoStore.userInfo.userId,
          userInfoStore.userInfo.nickName,
          userInfoStore.userInfo.sex,
          (props.deviceInfo.cameraEnable && props.deviceInfo.cameraOpen) ||
            !proxy.Utils.isEmpty(screenId)
        )
      "
    >
      <div
        class="video-panel"
        v-show="
          (props.deviceInfo.cameraEnable && props.deviceInfo.cameraOpen) ||
          !proxy.Utils.isEmpty(screenId)
        "
      >
        <video
          :id="`member_${userInfoStore.userInfo.userId}`"
          ref="localVideoRef"
          autoplay
          playsinline
          loop
          muted
        ></video>
        <div class="video-user-name">
          <div :class="['iconfont', proxy.Utils.getSexIcon(userInfoStore.userInfo.sex)]"></div>
          <div class="user-name">{{ userInfoStore.userInfo.nickName }}</div>
        </div>
      </div>
      <div
        class="user-info"
        v-show="
          !(
            (props.deviceInfo.cameraEnable && props.deviceInfo.cameraOpen) ||
            !proxy.Utils.isEmpty(screenId)
          )
        "
      >
        <Avatar :avatar="userInfoStore.userInfo.userId" :update="true"></Avatar>

        <div :class="['user-name', 'iconfont', proxy.Utils.getSexIcon(userInfoStore.userInfo.sex)]">
          {{ userInfoStore.userInfo.nickName }}
        </div>
      </div>
    </div>
    <div
      :class="['member-item', curentSelectId == item.userId ? 'active' : '', LAOUT_MAP[layoutType]]"
      v-for="(item, index) in memberList"
      :key="index"
      @click="selectMember(item.userId, item.nickName, item.sex, item.videoOpen)"
    >
      <div class="video-panel" v-show="item.videoOpen">
        <!-- {{ item.openVideo }} -->
        <video :id="`member_${item.userId}`" autoplay playsinline loop></video>
        <div class="video-user-name">
          <div :class="['iconfont', proxy.Utils.getSexIcon(item.sex)]"></div>
          <div class="user-name">{{ item.nickName }}</div>
        </div>
      </div>
      <div class="user-info" v-show="!item.videoOpen">
        <Avatar :avatar="item.userid" :update="true"></Avatar>

        <div :class="['user-name', 'iconfont', proxy.Utils.getSexIcon(item.sex)]">
          {{ item.nickName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { mitter } from '@/eventbus/eventBus.js'
import { ref, reactive, getCurrentInstance, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
import { useUserInfoStore } from '@/store/UserInfoStore'
const userInfoStore = useUserInfoStore()
import { useMeetingStore } from '@/store/MeetingStore'
const meetingStore = useMeetingStore()
const layoutType = ref(0) // 0: 2x2, 1: top, 2: right
const LIST_MAP = {
  0: 'member-list',
  1: 'member-list-top',
  2: 'member-list-right'
}
const LAOUT_MAP = {
  0: 'member-item',
  1: 'member-item-top',
  2: 'member-item-right'
}
const props = defineProps({
  deviceInfo: {
    type: Object,
    default: {}
  }
})
const emit = defineEmits(['selectMember', 'exitMeeting'])

const curentSelectId = ref()
const screenId = ref(route.query.screenId)
const gridStyle = computed(() => {
  if (layoutType.value != 0) {
    return ''
  }
  const { rows, clos } = calculateGrid(memberList.value.length + 1)
  // console.log(rows, clos)
  return {
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gridTemplateColumns: `repeat(${clos}, 1fr)`
  }
})

const calculateGrid = (count) => {
  if (count <= 0) {
    return {
      rows: 0,
      clos: 0
    }
  }
  if (count === 1) {
    return {
      rows: 1,
      clos: 1
    }
  }
  let clos = Math.ceil(Math.sqrt(count))
  let rows = Math.ceil(count / clos)
  return {
    rows,
    clos
  }
}

const memberList = ref([])

// 创建空的视频轨道
const createEmptyVideoTrack = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const stream = canvas.captureStream(1)
  return stream.getVideoTracks()[0]
}

// 创建一个静音的音轨
const createEmptyAudioTrack = () => {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const dst = oscillator.connect(audioContext.createMediaStreamDestination())
  oscillator.start()
  // const track = dst.stream.getVideoTracks()[0]
  const track = dst.stream.getAudioTracks()[0]
  track.enabled = false
  return track
}

const localVideoRef = ref()

let cameraStream = null
let screenStream = null
let localStream = null

/**
 * 初始化本地媒体流
 *
 * 该函数用于根据设备信息初始化本地的音视频流，包括麦克风、摄像头和屏幕共享等场景。
 * 它会根据 props.deviceInfo 中的配置决定是否启用音频或视频轨道，并处理屏幕共享逻辑。
 * 最终将生成的 MediaStream 绑定到本地视频元素上。
 *
 * 注意：此函数不接收参数，也不返回值，但会修改组件内部状态（如 localStream）。
 */
const initLocalStream = async () => {
  await nextTick()
  localStream = new MediaStream()

  // 如果麦克风未启用，则添加一个空的音频轨道并禁用它
  if (!props.deviceInfo.micEnable) {
    const micTrack = createEmptyAudioTrack()
    micTrack.enabled = false
    localStream.addTrack(micTrack)
  }

  // 如果启用了摄像头或麦克风，则初始化摄像头流，并将其轨道添加到本地流中
  if (props.deviceInfo.cameraEnable || props.deviceInfo.micEnable) {
    await initLocalCameraStream(props.deviceInfo.cameraEnable, props.deviceInfo.micEnable)
    cameraStream.getTracks().forEach((track) => {
      track.enabled = false
      localStream.addTrack(track)
    })
  }

  // 没有摄像头，也不是共享屏幕时，添加一个空的视频轨道
  if (!props.deviceInfo.cameraEnable && !screenId.value) {
    const videoTrack = createEmptyVideoTrack()
    videoTrack.enabled = false
    localStream.addTrack(videoTrack)
  }

  // 处理屏幕共享逻辑
  if (screenId.value) {
    // 移除当前视频轨道
    const videoTracks = localStream.getVideoTracks()
    if (videoTracks.length > 0) {
      localStream.removeTrack(videoTracks[0])
      videoTracks[0].stop()
    }
    // 初始化屏幕共享流，并添加其视频轨道
    await initLocalScreenStream()
    localStream.addTrack(screenStream.getVideoTracks()[0])
  } else if (!screenId.value && (props.deviceInfo.cameraEnable || props.deviceInfo.micEnable)) {
    // 根据设备开关状态设置音视频轨道的启用状态
    localStream.getTracks().forEach((track) => {
      if (track.kind == 'audio') {
        track.enabled = props.deviceInfo.micOpen
      }
      if (track.kind == 'video') {
        track.enabled = props.deviceInfo.cameraOpen
      }
    })
  } else if (!screenId.value && !props.deviceInfo.cameraEnable) {
    // 添加空的视频轨道以避免无视频流的情况
    const videoTrack = createEmptyVideoTrack()
    videoTrack.enabled = false
    localStream.addTrack(videoTrack)
  }

  // 将本地流绑定到本地视频元素上
  localVideoRef.value.srcObject = localStream
  // 加入会议
  joinMeeting(
    (props.deviceInfo.cameraEnable && props.deviceInfo.cameraOpen) ||
      !proxy.Utils.isEmpty(screenId.value)
  )
}

const initLocalScreenStream = async () => {
  return new Promise(async (resolve, reject) => {
    const constraints = {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: screenId.value,
        minWidth: 1024,
        maxWidth: 1600,
        minHeight: 768,
        maxHeight: 900,
        minFrameRate: 10,
        maxFrameRate: 25
      }
    }
    const stream = await navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: constraints
      })
      .catch((error) => {
        console.error(error)
      })
    screenStream = stream
    resolve(stream)
    return
  })
}
const initLocalCameraStream = async (video, audio) => {
  return new Promise(async (resolve, reject) => {
    if (!props.deviceInfo.cameraEnable && !props.deviceInfo.micEnable) {
      cameraStream = null
      resolve(null)
      return
    }
    const stream = await navigator.mediaDevices
      .getUserMedia({
        video,
        audio
      })
      .catch((error) => {
        console.error(error)
      })
    cameraStream = stream
    resolve(stream)
  })
}

const joinMeeting = async (videoOpen) => {
  let result = await proxy.Request({
    url: proxy.Api.joinMeeting,
    params: {
      videoOpen
    },
    showLoading: false
  })
  if (!result) {
    return
  }
}

const peerConnectionMap = new Map()
const SIGNAL_TYPE_OFFER = 'offer'
const SIGNAL_TYPE_ANSWER = 'answer'
const SIGNAL_TYPE_CANDIDATE = 'candidate'

/**
 * 创建或获取指定成员的WebRTC对等连接
 * @param {Object} member - 成员对象，包含userId等信息
 * @returns {RTCPeerConnection} WebRTC对等连接实例
 */
const createPeerConnection = (member) => {
  let peerConnection = peerConnectionMap.get(member.userId)
  if (peerConnection) {
    return peerConnection
  }

  // 创建新的RTCPeerConnection实例，配置WebRTC连接参数
  peerConnection = new RTCPeerConnection({
    sdpSemantics: 'unified-plan', // 明确使用现代标准
    codecs: { video: 'VP8' }, // 强制优先使用 VP8
    bundlePolicy: 'balanced', // 优化媒体传输通道的绑定策略
    rtcpMuxPolicy: 'require', // 强制 RTP/RTCP 多路复用
    iceServers: [{ urls: 'stun:stun.1.google.com:19302' }]
  })

  // 根据设备状态添加只接收视频的传输器
  if (!props.deviceInfo.cameraEnable) {
    peerConnection.addTransceiver('video', { direction: 'recvonly' })
  }

  // 根据设备状态添加只接收音频的传输器
  if (!props.deviceInfo.micEnable) {
    peerConnection.addTransceiver('audio', { direction: 'recvonly' })
  }

  // 监听ICE候选事件，发送候选信息给对端
  peerConnection.onicecandidate = (e) => {
    if (e.candidate) {
      sendPeerMessage({
        sendUserId: userInfoStore.userInfo.userId,
        signalType: SIGNAL_TYPE_CANDIDATE,
        signalData: e.candidate,
        receiveUserId: member.userId
      })
    }
  }

  // 监听媒体轨道事件，将接收到的媒体流绑定到对应视频元素
  peerConnection.ontrack = (e) => {
    // console.log('ontrack', e)
    const removeVideo = document.querySelector('#member_' + member.userId)
    removeVideo.srcObject = e.streams[0]
  }

  // 将本地媒体流的所有轨道添加到对等连接中
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream)
  })

  // 保存对等连接实例到映射表中
  peerConnectionMap.set(member.userId, peerConnection)
  return peerConnection
}

/**
 * 处理用户加入会议的回调函数
 * @param {Object} messageContent - 消息内容对象，包含新加入成员信息和所有成员列表
 * @returns {Promise<void>}
 */
const onUserJoin = async (messageContent) => {
  // console.log(messageContent)

  // 提取新加入的成员信息和所有成员列表，并按加入时间排序
  const newMember = messageContent.meetingMemberDto
  const allMemberList = messageContent.meetingMemberDtoList.sort((a, b) => a.joinTime - b.joinTime)

  // 过滤出除自己外的在线成员列表（状态为1表示在线）
  memberList.value = allMemberList.filter((item) => {
    return item.userId != userInfoStore.userInfo.userId && item.status == 1
  })

  // 更新会议状态管理中的成员列表
  meetingStore.setMemberList(memberList.value)
  meetingStore.setAllMemberList(allMemberList)

  // console.log('memberList', meetingStore.memberList)
  // console.log('allMemberList', meetingStore.allMemberList)

  await nextTick()

  // 如果是其他用户加入会议，显示加入提示并创建对等连接
  if (newMember.userId !== userInfoStore.userInfo.userId) {
    proxy.Message.success(`${newMember.nickName}加入了会议`)
    createPeerConnection(newMember)
    return
  }

  // 如果是自己加入会议，为每个现有成员创建对等连接并发送offer
  memberList.value.forEach((member) => {
    const peerConnection = createPeerConnection(member)
    // console.log('peerConnection', member)
    // peerConnectionMap.set(member.userId, peerConnection)
    sendOffer(peerConnection, userInfoStore.userInfo.userId, member.userId)
  })
}

const sendOffer = async (peerConnection, sendUserId, receiveUserId) => {
  let offer = await peerConnection.createOffer({ iceRestart: true })
  await peerConnection.setLocalDescription(offer)
  sendPeerMessage({
    sendUserId,
    receiveUserId,
    signalType: SIGNAL_TYPE_OFFER,
    signalData: offer
  })
}

const sendPeerMessage = ({ sendUserId, receiveUserId, signalType, signalData }) => {
  window.electron.ipcRenderer.send('sendPeerConnection', {
    sendUserId,
    receiveUserId,
    signalType,
    signalData: JSON.stringify(signalData)
  })
}
const initMeetingListener = () => {
  window.electron.ipcRenderer.on(
    'meetingMessage',
    (e, { sendUserId, receiveUserId, messageContent, messageType }) => {
      console.log('meetingMessage', { sendUserId, receiveUserId, messageContent, messageType })
      switch (messageType) {
        case 1: // 用户加入
          console.log('用户加入', messageContent)
          // TODO 用户加入
          onUserJoin(messageContent)
          break
        case 2: // 建立peerConnection
          // console.log('建立peerConnection', messageContent)
          onPeerConnection({ sendUserId, receiveUserId, messageContent })
          break
        case 3: // 退出会议
          onUserLeave(messageContent)
          break
        case 4: // 结束会议
          onMeetingEnd()
          break
        case 11: //用户改变摄像头状态
          onChangeCameraStatus(sendUserId, messageContent)
          break
      }
    }
  )
}
const onChangeCameraStatus = (sendUserId, videoOpen) => {
  if (sendUserId === userInfoStore.userInfo.userId) {
    return
  }
  const member = memberList.value.find((item) => {
    return item.userId == sendUserId
  })

  member.videoOpen = videoOpen

  if (curentSelectId.value === sendUserId) {
    emit('selectMember', {
      srcObject: document.querySelector('#member_' + member.userId).srcObject,
      userId: member.userId,
      nickName: member.nickName,
      sex: member.sex,

      videoOpen
    })
  }
}

const onMeetingEnd = () => {
  emit('exitMeeting')
}

const onUserLeave = (messageContent) => {
  const { exitUserId, meetingMemberDtoList } = JSON.parse(messageContent)
  if (userInfoStore.userInfo.userId === exitUserId) {
    emit('exitMeeting')
    return
  }

  memberList.value = memberList.value.filter(
    (item) => item.userId != exitUserId && item.status == 1
  )

  meetingStore.setMemberList(memberList.value)
  meetingStore.setAllMemberList(meetingMemberDtoList)
  peerConnectionMap.delete(exitUserId)
}

/**
 * 处理WebRTC信令连接的回调函数
 * @param {Object} params - 参数对象
 * @param {string} params.sendUserId - 发送消息的用户ID
 * @param {string} params.receiveUserId - 接收消息的用户ID
 * @param {Object} params.messageContent - 消息内容对象
 * @returns {Promise<void>}
 */
const onPeerConnection = async ({ sendUserId, receiveUserId, messageContent }) => {
  // 验证接收用户是否为当前用户，如果不是则直接返回
  if (receiveUserId !== userInfoStore.userInfo.userId) {
    return
  }

  // 解析信令数据
  const signalData = messageContent.signalData ? JSON.parse(messageContent.signalData) : {}

  // 查找发送消息的成员信息
  const member = memberList.value.find((item) => {
    return item.userId === sendUserId
  })

  // console.log('onPeerConnection', { sendUserId, receiveUserId, messageContent, signalData, member })

  // 创建WebRTC连接实例
  const peerConnection = createPeerConnection(member)

  try {
    // 根据不同的信令类型处理相应的连接逻辑
    switch (messageContent.signalType) {
      // 处理offer信令：设置远程描述，创建并发送answer回应
      case SIGNAL_TYPE_OFFER: {
        await peerConnection.setRemoteDescription(signalData)
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        sendPeerMessage({
          sendUserId: receiveUserId,
          receiveUserId: sendUserId,
          signalType: SIGNAL_TYPE_ANSWER,
          signalData: answer
        })
        break
      }
      // 处理answer信令：设置远程描述
      case SIGNAL_TYPE_ANSWER: {
        await peerConnection.setRemoteDescription(signalData)
        break
      }
      // 处理ICE候选者信令：添加ICE候选者
      case SIGNAL_TYPE_CANDIDATE: {
        if (!peerConnection.remoteDescription) {
          return
        }
        await peerConnection.addIceCandidate(signalData)
        break
      }
    }
  } catch (error) {
    console.error('err', error)
  }
}

/**
 * 处理麦克风开关切换的函数
 * @param {boolean} micOpen - 麦克风是否开启的状态
 * @returns {Promise<void>} 无返回值的异步函数
 */
const micSwithHandler = async (micOpen) => {
  // 更新本地音频流的启用状态
  if (localStream) {
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = micOpen
    })
  }

  // 更新所有成员的音频发送状态
  memberList.value.forEach((item) => {
    const pc = peerConnectionMap.get(item.userId)
    const sender = pc.getSenders().find((sender) => sender.track && sender.track.kind === 'audio')
    sender.track.enabled = micOpen
  })
}

const cameraSwithHandler = async (cameraOpen) => {
  if (cameraStream) {
    cameraStream.getVideoTracks().forEach((track) => {
      track.enabled = cameraOpen
    })
  }
  if (screenId.value) {
    return
  }

  sendOpenVideoChangeMessage(cameraOpen)
  if (!screenId.value && cameraOpen) {
    const videoTrack = cameraStream.getVideoTracks()[0]
    videoTrack.enabled = cameraOpen

    memberList.value.forEach((member) => {
      const pc = peerConnectionMap.get(member.userId)
      const sender = pc.getSenders().find((sender) => sender.track && sender.track.kind === 'video')
      sender.replaceTrack(videoTrack)
    })
    localVideoRef.value.srcObject = cameraStream
  }

  if (curentSelectId.value == userInfoStore.userInfo.userId) {
    emit('selectMember', {
      srcObject: localVideoRef.value.srcObject,
      userId: userInfoStore.userInfo.userId,
      nickName: userInfoStore.userInfo.nickName,
      sex: userInfoStore.userInfo.sex,
      videoOpen: cameraOpen
    })
  }
}

const sendOpenVideoChangeMessage = async (open) => {
  let result = await proxy.Request({
    url: proxy.Api.sendOpenVideoChangeMessage,
    params: {
      openVideo: open
    }
  })
  if (!result) {
    return
  }
}

const shareScreenHandler = async (_screenId) => {
  // console.log('shareScreenHandler', _screenId)
  sendOpenVideoChangeMessage(
    (props.deviceInfo.cameraOpen && props.deviceInfo.cameraEnable) ||
      !proxy.Utils.isEmpty(_screenId)
  )

  const oldScreenId = screenId.value
  if (!proxy.Utils.isEmpty(_screenId) && (!screenStream || oldScreenId !== _screenId)) {
    await initLocalScreenStream()
    localStream = screenStream
  } else if (proxy.Utils.isEmpty(_screenId) && props.deviceInfo.cameraEnable) {
    localStream = cameraStream
  }
  localVideoRef.value.srcObject = localStream

  const videoTrack = localStream ? localStream.getVideoTracks()[0] : null
  memberList.value.forEach(async (member) => {
    const pc = peerConnectionMap.get(member.userId)
    const sender = pc.getSenders().find((sender) => sender.track && sender.track.kind === 'video')
    if (videoTrack) {
      sender.replaceTrack(videoTrack)
    } else {
      sender.track.enabled = false
    }
  })

  if (curentSelectId.value == userInfoStore.userInfo.userId) {
    emit('selectMember', {
      srcObject: localVideoRef.value.srcObject,
      userId: userInfoStore.userInfo.userId,
      nickName: userInfoStore.userInfo.nickName,
      sex: userInfoStore.userInfo.sex,
      videoOpen:
        (props.deviceInfo.cameraEnable && props.deviceInfo.cameraOpen) ||
        !proxy.Utils.isEmpty(_screenId)
    })
  }
}

const layoutChangeHandler = (type) => {
  // console.log('member-layoutChangeHandler', type)
  if (type === layoutType.value) {
    return
  }
  layoutType.value = type
  // if (type != 0 && !curentSelectId.value) {
  curentSelectId.value = userInfoStore.userInfo.userId
  emit('selectMember', {
    srcObject: localVideoRef.value.srcObject,
    userId: userInfoStore.userInfo.userId,
    nickName: userInfoStore.userInfo.nickName,
    sex: userInfoStore.userInfo.sex,
    videoOpen:
      (props.deviceInfo.cameraEnable && props.deviceInfo.cameraOpen) ||
      !proxy.Utils.isEmpty(screenId.value)
  })
  // }
}

const selectMember = (userId, nickName, sex, videoOpen) => {
  if (layoutType.value == 0) {
    return
  }

  if (curentSelectId.value != userId) {
    emit('selectMember', {
      srcObject: document.querySelector('#member_' + userId).srcObject,
      userId,
      nickName,
      sex,
      videoOpen
    })
  }
  curentSelectId.value = userId
}

onMounted(() => {
  mitter.on('layoutChange', layoutChangeHandler)

  mitter.on('shareScreen', shareScreenHandler)
  mitter.on('micSwith', micSwithHandler)
  mitter.on('cameraSwith', cameraSwithHandler)
  initLocalStream()
  initMeetingListener()
})

onUnmounted(() => {
  mitter.off('layoutChange', layoutChangeHandler)
  mitter.off('shareScreen', shareScreenHandler)
  mitter.off('cameraSwith', cameraSwithHandler)
  mitter.off('micSwith', micSwithHandler)
})
</script>

<style lang="scss" scoped>
.member-list {
  height: 100%;
  display: grid;
  gap: 8px;
  max-height: 100%;
  padding: 10px;
  background: #fff;
  transition: grid-template 0.3s ease;
  overflow-y: auto;
}

.member-list-top {
  display: inline-flex;
  grid-gap: 0px;
  padding: 10px 0px 10px 10px;
  overflow-x: auto;
  max-width: 100%;
  height: 120px;
  .member-item {
    cursor: pointer;
  }
  .active {
    border: 2px solid var(--blue);
  }
}

.member-list-right {
  display: flex;
  flex-direction: column;
  grid-gap: 0px;
  padding: 10px 10px 0px 10px;
  width: 130px;
  align-items: center;
  margin: auto;
  .member-item {
    cursor: pointer;
  }
  .active {
    border: 2px solid var(--blue);
  }
}

.member-item {
  background: #f7f7f7;
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  border: 2px solid #fff;
  .video-panel {
    height: 100%;
    position: relative;
    video {
      height: 100%;
      width: 100%;
      object-fit: cover;
    }
    .video-user-name {
      position: absolute;
      top: 0px;
      right: 0px;
      display: flex;
      align-items: center;
      border-radius: 0px 0px 0px 5px;
      overflow: hidden;
      .iconfont {
        width: 20px;
        height: 20px;
        background: var(--blue);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-woman {
        background: #fb7373;
      }
      .user-name {
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        font-size: 12px;
        height: 20px;
        padding: 0px 3px;
        max-width: 80px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding-top: 2px;
      }
    }
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

.member-my {
  video {
    transform: scaleX(-1);
  }
}

.member-item-top {
  width: 100px;
  height: 100px;
  margin-right: 10px;
  .video-panel {
    width: 100px;
    height: 100px;
  }
}

.member-item-right {
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
  .video-panel {
    width: 100px;
    height: 100px;
  }
}
</style>
