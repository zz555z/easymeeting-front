<template>
  <Dialog
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="660px"
    :showCancel="false"
    @close="dialogConfig.show = false"
  >
    <el-form :model="formData" ref="formDataRef" label-width="80px" @submit.prevent>
      <el-form-item label="" prop="">
        <el-transfer
          v-model="formData.selectContactIds"
          :titles="['全部', '已选']"
          :format="{
            noChecked: '${total}',
            hasChecked: '${checked}/${total}'
          }"
          :data="contactList"
          :props="{
            key: 'contactId',
            label: 'nickName'
          }"
          filterable
          :filter-method="search"
        >
          <template #default="{ option }">
            <div class="nick-name">{{ option.nickName }}</div>
          </template>
        </el-transfer>
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
import { useMeetingStore } from '@/store/MeetingStore'
const meetingStore = useMeetingStore()

const dialogConfig = reactive({
  show: false,
  title: '选择联系人',
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

const search = (query, item) => {
  return item.nickName.toLowerCase().includes(query.toLowerCase())
}
const contactList = ref([])

const loadContactList = async () => {
  let result = await proxy.Request({
    url: proxy.Api.loadContactUser,
    params: {}
  })
  if (!result) {
    return
  }
  const inMeetingMembers = meetingStore.memberList.map((item) => {
    return item.userId
  })
  contactList.value = result.data.map((item) => {
    if (inMeetingMembers.includes(item.contactId)) {
      item.disabled = true
      item.nickName = item.nickName + '(已入会)'
    } else if (item.onlinetype == 1) {
      item.nickName = item.nickName + '(在线)'
    } else if (item.onlinetype == 0) {
      item.disabled = true
      item.nickName = item.nickName + '(离线)'
    }
    return item
  })
}

const formDataRef = ref()
const formData = ref({
  selectContactIds: []
})

const show = () => {
  loadContactList()
  dialogConfig.show = true
  formData.value = {
    selectContactIds: []
  }
}
const submitForm = async () => {
  if (formData.value.selectContactIds.length == 0) {
    proxy.Message.warning('请选择联系人')
    return
  }
  let params = {}
  Object.assign(params, formData.value)
  params.selectContactIds = params.selectContactIds.join(',')
  let result = await proxy.Request({
    url: proxy.Api.inviteMember,
    params
  })
  if (!result) {
    return
  }
  dialogConfig.show = false
  proxy.Message.success('已发送邀请')
}

defineExpose({
  show
})
</script>

<style lang="scss" scoped>
.el-transfer {
  width: 100%;
  // display: block !important;
  display: flex;
  gap: 10px; // 可选，增加间距

  :deep(.el-transfer-panel) {
    width: 200px;
  }
  :deep(.el-transfer-panel__item) {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 5px;
  }
}
:deep(.el-transfer__buttons) {
  width: 60px;
  flex-direction: column;
  text-align: center;
  padding: 0px;
  .el-transfer__button {
    text-align: center;
    margin-left: 0px;
    margin-right: 0px;
    margin-top: 5px;
    padding: 10px;
    height: 36px;
    border-radius: 50%;
  }
}

.select-item {
  display: flex;
  .avatar {
    width: 30px;
    height: 30px;
  }
  .nick-name {
    flex: 1;
    margin-left: 5px;
  }
}
</style>
