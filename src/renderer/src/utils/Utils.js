import moment from 'moment'
import LunarCalendar from 'lunar-calendar'
import { Api } from '@/utils/Api'

moment.locale('zh-cn', {
  months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
  monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
  weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
  longDateFormat: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'YYYY-MM-DD',
    LL: 'YYYY年MM月DD日',
    LLL: 'YYYY年MM月DD日Ah点mm分',
    LLLL: 'YYYY年MM月DD日ddddAh点mm分',
    l: 'YYYY-M-D',
    ll: 'YYYY年M月D日',
    lll: 'YYYY年M月D日 HH:mm',
    llll: 'YYYY年M月D日dddd HH:mm'
  }
})

const isEmpty = (str) => {
  if (str == null || str == '' || str == undefined) {
    return true
  }
  return false
}

const formatDate = (timestamp) => {
  const timestampTime = moment(timestamp)
  const days =
    Number.parseInt(moment().format('YYYYMMDD')) - Number.parseInt(timestampTime.format('YYYYMMDD'))
  if (days == 0) {
    return timestampTime.format('HH:mm')
  } else if (days == 1) {
    return '昨天'
  } else if (days >= 2 && days < 7) {
    // 大于1天小于7天显示星期几
    return timestampTime.format('dddd')
  } else if (days >= 7) {
    // 显示年月日
    return timestampTime.format('YYYY-MM-DD')
  }
}

const formatDate2 = (timestamp, patten) => {
  const timestampTime = moment(timestamp)
  if (!timestampTime.isValid()) {
    console.info('无效的日期格式:', timestamp)
    return // 或返回默认值，如 '00:00'
  }
  return timestampTime.format(patten)
}

const getChinaDateDay = () => {
  const today = moment()
  // 计算周几（中文）
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][today.day()]
  // 转换为农历日期（注意月份需+1，因moment月份从0开始）
  const lunar = LunarCalendar.solarToLunar(today.year(), today.month() + 1, today.date())
  // 处理闰月显示
  const isLeap = lunar.isLeap ? '闰' : ''
  const lunarDate = `${isLeap}${lunar.lunarMonthName}${lunar.lunarDayName}`
  return `星期${weekday} 农历${lunarDate}`
}

const getWeekAndDate = (timestamp) => {
  const today = moment(new Date(timestamp))
  // 计算周几（中文）
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][today.day()]
  return `星期${weekday} ${today.format('M月DD日')}`
}

const size2Str = (limit) => {
  var size = ''
  if (limit < 0.1 * 1024) {
    // 小于0.1KB，则转化成B
    size = limit.toFixed(2) + 'B'
  } else if (limit < 1024 * 1024) {
    // 小于0.1MB，则转化成KB
    size = (limit / 1024).toFixed(2) + 'KB'
  } else if (limit < 1024 * 1024 * 1024) {
    // 小于1GB，则转化成MB
    size = (limit / (1024 * 1024)).toFixed(2) + 'MB'
  } else {
    // 其他转化成GB
    size = (limit / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
  }
  var sizeStr = size + '' // 转成字符串
  var index = sizeStr.indexOf('.') // 获取小数点处的索引
  var dou = sizeStr.substring(index + 1, 2) // 获取小数点后两位的值
  if (dou == '00') {
    // 判断后两位是否为00，如果是则删除00
    return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
  }
  return size
}

const convertSecondsToHMS = (seconds, showHours = false) => {
  var hours = Math.floor(seconds / 3600)
  var minutes = Math.floor((seconds % 3600) / 60)
  var remainingSeconds = seconds % 60
  let hourStr = showHours ? '00:' : ''
  return (
    (hours == 0 ? hourStr : hours.toString().padStart(2, '0') + ':') +
    minutes.toString().padStart(2, '0') +
    ':' +
    remainingSeconds.toString().padStart(2, '0')
  )
}

const timeAddMin = (timestamp, addMin) => {
  return moment(timestamp).add(addMin, 'minutes').format('HH:mm')
}

const getFileName = (fileName) => {
  if (!fileName) {
    return fileName
  }
  return fileName.lastIndexOf('.') == -1
    ? fileName
    : fileName.substring(0, fileName.lastIndexOf('.'))
}

const getLocalResource = (resource) => {
  resource = `../assets/${resource}`
  return new URL(resource, import.meta.url).href
}

const resetHtmlContent = (data) => {
  if (!data) {
    return data
  }
  data = data.replace(/\r\n/g, '<br>')
  data = data.replace(/\n/g, '<br>')
  return data
}

const getToken = () => {
  let userInfoJson = localStorage.getItem('userInfo')
  const token = userInfoJson ? JSON.parse(userInfoJson).token : ''
  return token
}

const getResroucePath = ({ messageId, thumbnail = false, fileType, sendTime }) => {
  return `${import.meta.env.PROD ? import.meta.env.VITE_DOMAIN : ''}${Api.getResource}?messageId=${messageId}&fileType=${fileType}&thumnail=${thumbnail}&sendTime=${sendTime}&token=${getToken()}`
}

const getAvatarPath = (userId, forceUpdate = false) => {
  return `${import.meta.env.PROD ? import.meta.env.VITE_DOMAIN : ''}${Api.getAvatar}?userId=${userId}&token=${getToken()}&t=${forceUpdate ? Date.now() : ''}`
}

const formatMeetingNo = (meetingNo) => {
  return (
    meetingNo.substring(0, 3) + ' ' + meetingNo.substring(3, 6) + ' ' + meetingNo.substring(6, 10)
  )
}

const getSexIcon = (sex) => {
  if (sex == 0) {
    return 'icon-nvren'
  } else if (sex == 1) {
    return 'icon-nanren'
  } else {
    return 'icon-ziyuanxhdpi'
  }
}

export default {
  isEmpty,
  formatDate,
  formatDate2,
  getChinaDateDay,
  getWeekAndDate,
  size2Str,
  convertSecondsToHMS,
  timeAddMin,
  getFileName,
  getLocalResource,
  resetHtmlContent,
  getResroucePath,
  getAvatarPath,
  formatMeetingNo,
  getSexIcon
}
