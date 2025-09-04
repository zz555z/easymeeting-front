<template>
  <div :style="{ width: width + 'px', height: width + 'px' }">
    <Cover :lazy="false" :width="width" :source="avatarUrl" borderRadius="50%" :scale="1"></Cover>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const props = defineProps({
  width: {
    type: Number,
    default: 50
  },
  avatar: {
    type: String
  },
  update: {
    type: Boolean,
    default: false
  }
})

const avatarUrl = ref(proxy.Utils.getAvatarPath(props.avatar, props.update))

const updateAvatar = () => {
  avatarUrl.value = proxy.Utils.getAvatarPath(props.avatar, true)
}

defineExpose({
  updateAvatar
})
</script>

<style lang="scss" scoped></style>
