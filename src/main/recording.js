const fs = require('fs')
const { spawn } = require('child_process')
const path = require('path')
const { app, screen } = require('electron')
const NODE_ENV = process.env.NODE_ENV

const ffmpgPath = '/assets/ffmpeg' // Ensur e ffmpeg is installed and in your PATH

const getResourcePath = () => {
  let resourcePath = app.getAppPath()
  if (process.env.NODE_ENV !== 'development') {
    resourcePath = path.dirname(app.getPath('exe')) + '/resources'
  }
  return resourcePath
}

const getFFmpgPath = () => {
  return path.join(getResourcePath(), ffmpgPath)
}

let ffmpegProcess = null
let currentTime = 0
let sender = null
const startRecording = (_sender, displayId, mic) => {
  sender = _sender
  currentTime = 0
  let filePath = '/Users/zdd/IdeaProjects/easymeeting-front/tmp'
  filePath = path.join(filePath, new Date().getTime() + '_tmp.mp4')
  const { bounds, workArea } = getScreenInfo(displayId)
  const ffmpeg = getFFmpgPath()
  // macOS 下使用 avfoundation 框架，适配屏幕录制 + 音频采集
  let args = [
    '-f',
    'avfoundation',
    '-framerate',
    '30', // 帧率 30fps
    '-video_size',
    `${workArea.width}x${workArea.height}`, // 录制尺寸
    '-i',
    '3:0'
    // '3:0'
    // `${shebei}`
  ]

  const otherArgs = [
    // 视频编码
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '18',
    '-g',
    '60', // 每2秒一个关键帧（帧率30的话，30*2=60）
    '-x264-params',
    'nal-hrd=cbr:force-cfr=1', // 恒定帧率
    // 音频编码
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-ar',
    '44100',
    '-ac',
    '2', // 立体声
    // 像素格式
    '-pix_fmt',
    'yuyv422',
    // 防损坏关键参数 - 修复 moov atom 问题
    '-movflags',
    'frag_keyframe+empty_moov+faststart',
    '-flush_packets',
    '1',
    '-fflags',
    '+genpts',
    '-max_interleave_delta',
    '0', // 减少交错延迟
    filePath
  ]

  args = args.concat(otherArgs)
  console.log('startRecording-->命令:', `${ffmpeg} ${args.join(' ')}`)
  ffmpegProcess = spawn(ffmpeg, args, {
    stdio: ['ignore', 'pipe', 'pipe'], // 捕获 stdout 和 stderr
    detached: true, // 创建独立进程组，
    shell: false
  })
  ffmpegProcess.stderr.on('data', (data) => {
    const output = data.toString()
    const timeMatch = output.match(/time=(\S+)/)
    if (timeMatch && timeMatch[1]) {
      const seconds = parseTime(timeMatch[1])
      if (seconds > currentTime) {
        sender.send('recordTime', seconds)
        currentTime = seconds
      }
    }
  })
  ffmpegProcess.on('error', (error) => {
    console.log(`ffmpeg error--> ${error}`)
    ffmpegProcess = null
  })

  ffmpegProcess.on('exit', () => {
    ffmpegProcess = null
    repairVideo(filePath)
  })
}

const repairVideo = (filePath) => {
  const ffmpeg = getFFmpgPath()
  const args = ['-i', filePath, filePath.replace('_tmp', '')]
  console.log('repairVideo--命令:', `${ffmpeg} ${args.join(' ')}`)

  const process = spawn(ffmpeg, args, {
    stdio: ['ignore', 'pipe', 'pipe'], // 捕获 stdout 和 stderr
    detached: true // 创建独立进程组
  })
  process.on('error', (error) => {
    console.log('repairVideo---->', error)
  })

  process.on('exit', (code) => {
    if (code === 0) {
      fs.unlinkSync(filePath)
      sender.send('finishReording', { filePath: filePath.replace('_tmp', '') })
    }
  })
}

const parseTime = (timeStr) => {
  const parts = timeStr.split(':')
  let seconds = 0
  if (parts.length === 3) {
    // HH:MM:SS.ms
    seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2].split('.')[0])
  }
  return seconds
}

const getScreenInfo = (displayId) => {
  const displays = screen.getAllDisplays()

  return displays.find((item) => {
    return item.id == displayId
  })
}

const stopRecording = () => {
  if (ffmpegProcess) {
    ffmpegProcess.kill('SIGINT')
  }
}
export { startRecording, stopRecording }
