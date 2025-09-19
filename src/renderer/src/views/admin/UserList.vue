<template>
  <div class="top-panel">
    <el-form :model="searchForm" label-width="50px" label-position="right">
      <el-row>
        <el-col :span="8">
          <el-form-item label="昵称">
            <el-input
              class="password-input"
              v-model="searchForm.nickName"
              clearable
              placeholder="支持模糊搜索"
              @keyup.enter="loadDataList"
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4" :style="{ paddingLeft: '10px' }">
          <el-button type="success" @click="loadDataList()">查询</el-button>
        </el-col>
      </el-row>
    </el-form>
    <Table :columns="columns" :fetch="loadDataList" :dataSource="tableData" :options="tableOptions">
      <template #slotAvatar="{ row }">
        <Avatar :avatar="row.userId"></Avatar>
      </template>

      <template #slotNickName="{ row }">
        {{ row.nickName }} ({{ row.userId }})
        <span v-if="row.sex === 0" class="iconfont icon-woman"></span>
        <span v-if="row.sex === 1" class="iconfont icon-man"></span>
      </template>

      <template #slotStatus="{ row }">
        <span style="color: red" v-if="row.status === 0">禁用</span>
        <span style="color: green" v-else>启用</span>
      </template>

      <template #slotOnline="{ row }">
        <span style="color: green" v-if="row.onlineType === 1">在线</span>
        <span style="color: #8a8a8a" v-else>离线</span>
      </template>
      <template #slotOperation="{ row }">
        <el-dropdown
          placement="bottom-end"
          trigger="click"
          v-if="userInfoStore.userInfo.userId != row.userId"
        >
          <span class="iconfont icon-sangedian"></span>
          <template #dropdown>
            <el-dropdown-item @click="changeAccountStatus(row)">{{
              row.status == 0 ? '启用' : '禁用'
            }}</el-dropdown-item>
            <el-dropdown-item @click="forceOffline(row)" v-if="row.onlineType == 1"
              >强制下线</el-dropdown-item
            >
          </template>
        </el-dropdown>
        <div v-else>管理员</div>
      </template>
    </Table>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
import { useUserInfoStore } from '@/store/UserInfoStore'
const userInfoStore = useUserInfoStore()
const columns = [
  {
    label: '头像',
    prop: 'userId',
    width: 70,
    scopedSlots: 'slotAvatar'
  },
  {
    label: '昵称',
    prop: 'nickName',
    scopedSlots: 'slotNickName'
  },
  {
    label: '邮箱',
    prop: 'email',
    width: 200
  },
  {
    label: '加入时间',
    prop: 'createTime',
    width: 200
  },
  {
    label: '用户状态',
    prop: 'status',
    width: 100,
    scopedSlots: 'slotStatus'
  },
  {
    label: '在线状态',
    prop: 'onlineType',
    width: 100,
    scopedSlots: 'slotOnline'
  },
  {
    label: '操作',
    prop: 'operation',
    width: 100,
    scopedSlots: 'slotOperation'
  }
]
const tableData = ref({})
const tableOptions = ref()
const searchForm = ref({})
const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo || 1,
    pageSize: tableData.value.pageSize || 20
  }
  Object.assign(params, searchForm.value)
  let result = await proxy.Request({
    url: proxy.Api.loadUserList,
    params
  })
  if (!result) {
    return
  }

  Object.assign(tableData.value, result.data)
}

const changeAccountStatus = (data) => {
  let status = data.status == 0 ? 1 : 0
  let info = status == 0 ? '禁用' : '启用'
  proxy.Confirm({
    message: `确认要【${info}】【${data.nickName}】吗？`,
    okfun: async () => {
      let result = await proxy.Request({
        url: proxy.Api.updateUserStatus,
        params: {
          userId: data.userId,
          userStatus: status
        }
      })
      if (!result) {
        return
      }
      proxy.Message.success('操作成功')
      loadDataList()
    }
  })
}

const forceOffline = (data) => {
  proxy.Confirm({
    message: `确认要将【${data.nickName}】强制下线吗？`,
    okfun: async () => {
      let result = await proxy.Request({
        url: proxy.Api.forceOffline,
        params: {
          userId: data.userId
        }
      })
      if (!result) {
        return
      }
      proxy.Message.success('操作成功')
      loadDataList()
    }
  })
}
</script>

<style lang="scss" scoped>
.icon-man {
  color: #2cb6fe;
}
.icon-woman {
  color: #fb7373;
}
</style>
