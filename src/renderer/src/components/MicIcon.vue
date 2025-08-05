<template>
  <div class="mic-panel">
    <div class="mic-show" :style="{ width: size + 'px', height: size + 'px' }">
      <div class="iconfont icon-close" v-if="!micDeviceInfo.open || !micDeviceInfo.enable"></div>
      <div class="iconfont icon-robot" v-else></div>
      <div class="volume" :style="{ height: volume * 1.5 + 'px' }"></div>
    </div>
    <div v-if="showLabel" :class="['mic-label', micDeviceInfo.open ? 'active' : '']">
      {{ micDeviceInfo.label }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const props = defineProps({
  size: {
    type: Number,
    default: 30
  },
  modelValue: {
    type: Object,
    default: {}
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  defaultOpen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])
const micDeviceInfo = ref({})
let stream = null
const getMicrophones = async () => {
  let devices = []
  try {
    devices = await navigator.mediaDevices.enumerateDevices()
    // console.log(devices)
  } finally {
    let defaultMic = devices.find((device) => {
      return device.kind == 'audioinput' && device.deviceId === 'default'
    })
    if (!defaultMic) {
      micDeviceInfo.value = {
        deviceId: '0',
        label: '未获取到麦克风',
        open: false,
        enable: false
      }
      emit('update:modelValue', micDeviceInfo.value)
      return
    }
    const label = getDevicesLabel(defaultMic)
    const constraints = {
      audio: {
        deviceId: defaultMic.deviceId ? { exact: defaultMic.deviceId } : undefined
      },
      video: false
    }

    stream = await navigator.mediaDevices.getUserMedia(constraints).catch((error) => {})
    micDeviceInfo.value = {
      deviceId: defaultMic.deviceId,
      label,
      open: props.defaultOpen,
      enable: stream != null
    }
    emit('update:modelValue', micDeviceInfo.value)
    if (!micDeviceInfo.value.enable) {
      return
    }

    if (micDeviceInfo.value.enable && props.defaultOpen) {
      showAnimation()
    }
  }
}

let analyser
let microphone
const showAnimation = () => {
  if (!stream) {
    return
  }
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  analyser = audioContext.createAnalyser()
  analyser.fftsize = 2048
  microphone = audioContext.createMediaStreamSource(stream)
  microphone.connect(analyser)
  animate()
}
const animate = () => {
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteTimeDomainData(dataArray)
  analyser.getByteFrequencyData(dataArray)
  calculateVolume(dataArray)
  requestAnimationFrame(() => {
    animate()
  })
}

const volume = ref(0)
const calculateVolume = (dataArray) => {
  let sum = 0
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i]
  }
  const average = sum / dataArray.length
  volume.value = Math.min(100, Math.round((average / 255) * 100))
}
const getDevicesLabel = (defaultMic) => {
  // 可以做一些正则处理，懒得弄
  return defaultMic.label
}

const toggleMic = () => {
  if (!micDeviceInfo.value.enable) {
    return
  }
  micDeviceInfo.value.open = !micDeviceInfo.value.open
  emit('update:modelValue', micDeviceInfo.value)
  if (micDeviceInfo.value.open) {
    showAnimation()
  } else {
    stopAnimation()
  }
}

const stopAnimation = () => {
  if (microphone && analyser) {
    microphone.disconnect(analyser)
  }
}

onMounted(() => {
  getMicrophones()
})

defineExpose({ toggleMic })
</script>
<style lang="scss" scoped>
.mic-panel {
  display: flex;
  align-items: center;

  .mic-show {
    background: #ddd;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    cursor: pointer;

    .icon-robot {
      color: var(--blue);
    }

    .icon-close {
      color: #5b5b5b;
    }

    .volume {
      position: absolute;
      left: 0px;
      right: 0px;
      bottom: 0px;
      background: rgba(4, 91, 241, 0.3);
    }
  }

  .mic-label {
    margin-left: 5px;
    font-size: 14px;
    color: #8b8b8b;
  }

  .active {
    color: #494949;
  }
}
</style>
