<template>
  <Dialog
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="400px"
    :showCancel="false"
    @close="dialogConfig.show = false"
  >
    <div>#会议号：{{ proxy.Utils.formatMeetingNo(meetingInfo.meetingNo) }}</div>
    <div>#密&nbsp;&nbsp;&nbsp;码：{{ meetingInfo.password || '无密码' }}</div>
    <div class="copy-btn">
      <el-button type="primary" @click="copyText">复制会议信息</el-button>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const dialogConfig = reactive({
  show: false,
  title: '分享会议'
})

const meetingInfo = ref({})

const show = (data) => {
  meetingInfo.value = data
  dialogConfig.show = true
}

const copyText = async () => {
  await navigator.clipboard.writeText(
    `#会议号：${meetingInfo.value.meetingNo}  #密码：${meetingInfo.value.password || '无密码'}`
  )
  proxy.Message.success('复制成功')
}

defineExpose({
  show
})
</script>

<style lang="scss" scoped>
.copy-btn {
  display: flex;
  justify-content: end;
}
</style>
