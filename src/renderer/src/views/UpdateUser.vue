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
      <el-form-item label="UID">
        {{ formData.userId }}
      </el-form-item>
      <el-form-item label="头像" prop="">
        <div class="avatar-upload">
          <Cover :width="80" :scale="1" :source="formData.avatar" defaultImg="user.png"></Cover>
          <el-upload
            :multiple="false"
            :show-file-list="false"
            :http-request="selectFile"
            :accept="proxy.imageAccept"
          >
            <el-button type="primary" class="select-btn">选择</el-button>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input clearable placeholder="请输入昵称" v-model.trim="formData.nickName"></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="formData.sex">
          <el-radio :value="0">女</el-radio>
          <el-radio :value="1">男</el-radio>
          <el-radio :value="2">保密</el-radio>
        </el-radio-group>
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
  title: '修改用户信息',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: (e) => {
        submitForm()
      }
    }
  ]
})

const formData = ref({})
const formDataRef = ref()
const rules = {
  avatar: [{ required: true, message: '请选择头像' }],
  nickName: [{ required: true, message: '请输入昵称' }],
  sex: [{ required: true, message: '请选择性别' }]
}

const selectFile = (file) => {
  file = file.file
  formData.value.avatar = file
}

const emit = defineEmits(['reloadInfo'])
const submitForm = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = {}
    Object.assign(params, formData.value)
    let result = await proxy.Request({
      url: proxy.Api.updateUserInfo,
      params
    })
    if (!result) {
      return
    }
    proxy.Message.success('修改成功')
    dialogConfig.show = false
    emit('reloadInfo', formData.value)
  })
}

const show = () => {
  dialogConfig.show = true
  formData.value = userInfoStore.userInfo
  formData.value.avatar = proxy.Utils.getAvatarPath(formData.value.userId, true)
}

defineExpose({
  show
})
</script>

<style lang="scss" scoped>
.avatar-upload {
  display: flex;
  align-items: flex-end;
  .select-btn {
    margin-left: 5px;
  }
}
</style>
