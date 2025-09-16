<template>
  <Dialog
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="400px"
    :showCancel="false"
    @close="dialogConfig.show = false"
  >
    <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="80px" @submit.prevent>
      <el-form-item label="会议号" prop="">
        <el-radio-group v-model="formData.meetingNoType">
          <el-radio :value="0">使用个人会议号</el-radio>
          <el-radio :value="1">系统生成</el-radio>
        </el-radio-group>
        <el-input
          clearable
          placeholder="请输入会议号"
          v-model="formData.meetingNo"
          disabled
          v-if="formData.meetingNoType == 0"
        ></el-input>
      </el-form-item>

      <el-form-item label="会议主题" prop="meetingName">
        <el-input
          clearable
          placeholder="请输入会议主题"
          :maxlength="100"
          :show-word-limit="true"
          v-model="formData.meetingName"
        ></el-input>
      </el-form-item>

      <el-form-item label="入会密码" prop="joinType">
        <el-radio-group v-model="formData.joinType">
          <el-radio :value="0">无需密码</el-radio>
          <el-radio :value="1">密码入会</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item prop="joinPassword" v-if="formData.joinType == 1">
        <el-input
          clearable
          placeholder="请输入入会密码"
          :maxlength="5"
          :show-word-limit="true"
          v-model="formData.joinPassword"
        ></el-input>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
import { useUserInfoStore } from '@/store/UserInfoStore'
const userInfoStore = useUserInfoStore()

const dialogConfig = reactive({
  show: false,
  title: '快速会议',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: (e) => {
        quickMeeting()
      }
    }
  ]
})

const formData = ref({})
const formDataRef = ref()
const rules = {
  meetingName: [{ required: true, message: '请输入会议主题' }],
  joinPassword: [{ required: true, message: '请输入入会密码' }]
}

const show = () => {
  dialogConfig.show = true
  // dialogConfig.value.show = true
  nextTick(() => {
    formDataRef.value.resetFields()
    formData.value = {
      meetingNo: userInfoStore.userInfo.meetingNo,
      meetingNoType: 0,
      joinType: 0
    }
  })
}

defineExpose({
  show
})

const emit = defineEmits(['joinMeeting'])
const quickMeeting = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let result = await proxy.Request({
      url: proxy.Api.quickMeeting,
      params: Object.assign({}, formData.value)
    })
    if (!result) {
      return
    }
    dialogConfig.show = false
    emit('joinMeeting')
  })
}
</script>

<style lang="scss" scoped>
// .el-form-item__label {
//   white-space: nowrap;
// }
</style>
