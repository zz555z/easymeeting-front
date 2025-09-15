import { createRouter, createWebHashHistory } from 'vue-router'
const router = createRouter({
  mode: 'hash',
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '登录',
      component: () => import('@/views/login/Login.vue')
    },
    {
      path: '/showMedia',
      name: '媒体详情',
      component: () => import('@/views/meeting/chat/showMedia.vue')
    },
    {
      path: '/meeting',
      name: '会议详情',
      component: () => import('@/views/meeting/meeting/Meeting.vue')
    },
    {
      path: '/home',
      name: '主界面',
      component: () => import('@/views/Layout.vue'),
      redirect: '/meetingMain',
      children: [
        {
          path: '/meetingMain',
          name: '会议首页',
          component: () => import('@/views/meeting/MeetingMain.vue'),
          meta: {
            code: 'meeting'
          }
        },
        {
          path: '/contact',
          name: '联系人',
          component: () => import('@/views/contact/Contact.vue'),
          meta: {
            code: 'contact'
          }
        },
        {
          path: '/screencap',
          name: '录制',
          component: () => import('@/views/screencap/ScreenCap.vue'),
          meta: {
            code: 'screencap'
          }
        },
        {
          path: '/setting',
          name: '设置',
          component: () => import('@/views/setting/Setting.vue'),
          meta: {
            code: 'setting'
          }
        }
      ]
    }
  ]
})

export default router
