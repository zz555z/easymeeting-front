import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import router from '@/router'
import '@/assets/base.scss'
import '@/assets/icon/iconfont.css'

import { createApp } from 'vue'
import App from './App.vue'
import Header from '@/components/Header.vue'
import TitleBar from '@/components/TitleBar.vue'
import NoData from '@/components/NoData.vue'
import Dialog from '@/components/Dialog.vue'
import Cover from '@/components/Cover.vue'
import Avatar from '@/components/Avatar.vue'
import DataLoadList from '@/components/DataLoadList.vue'

import Request from '@/utils/Request.js'
import { Api } from '@/utils/Api.js'
import Utils from '@/utils/Utils.js'
import Verify from '@/utils/Verify.js'
import Message from '@/utils/Message.js'
import { Confirm, Alert } from '@/utils/Confirm.js'
import * as Pinia from 'pinia'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(Pinia.createPinia())

app.component('Header', Header)
app.component('TitleBar', TitleBar)
app.component('NoData', NoData)
app.component('Dialog', Dialog)
app.component('Cover', Cover)
app.component('Avatar', Avatar)
app.component('DataLoadList', DataLoadList)

app.config.globalProperties.Request = Request
app.config.globalProperties.Api = Api
app.config.globalProperties.Utils = Utils
app.config.globalProperties.Verify = Verify
app.config.globalProperties.Message = Message
app.config.globalProperties.Confirm = Confirm
app.config.globalProperties.Alert = Alert
app.config.globalProperties.imageAccept = '.jpg,.png,.gif,.bmp,.webp,.jpeg'
// 保证在最下面
app.mount('#app')
