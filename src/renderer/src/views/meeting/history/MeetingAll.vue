<template>
  <Header title="全部会议" :showMax="false" :closeType="0"></Header>
  <div class="tabs">
    <el-tabs v-model="activeName">
      <el-tab-pane label="历史会议" name="history"></el-tab-pane>
      <el-tab-pane label="待开会议" name="reserve"></el-tab-pane>
    </el-tabs>
  </div>
  <!-- {{ activeName }} -->
  <MeetingHistory ref="meetingHistoryRef" v-if="activeName === 'history'"></MeetingHistory>
  <MeetingReserve ref="meetingReserveRef" v-if="activeName === 'reserve'"></MeetingReserve>
</template>

<script setup>
import MeetingReserve from '../history/MeetingReserve.vue'
import MeetingHistory from '../history/MeetingHistory.vue'
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const activeName = ref('history')
</script>

<style lang="scss" scoped>
.tabs {
  padding: 0px 10px;
  :deep {
    .el-tabs__header {
      margin: 0px;
    }
  }
}
</style>
