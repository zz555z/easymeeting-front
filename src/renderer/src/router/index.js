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
          path: '/meeting/:id',
          name: '会议详情'
        }
      ]
    }
  ]
})

export default router
