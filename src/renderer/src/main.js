import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import router from '@/router'
import '@/assets/base.scss'
import '@/assets/icon/iconfont.css'

import { createApp } from 'vue'
import App from './App.vue'
import Header from '@/components/Header.vue'
import TitleBar from '@/components/TitleBar.vue'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.component('Header', Header)
app.component('TitleBar', TitleBar)

// 保证在最下面
app.mount('#app')
