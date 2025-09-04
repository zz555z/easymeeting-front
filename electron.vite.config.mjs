import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src')
      }
    },
    plugins: [vue()],
    server: {
      historyApiFallback: true,
      hmr: true,
      port: 6001,
      proxy: {
        //  /api 开头的请求会转发，不然会有跨域问题 dev环境的域名为null 生产环境域名为打包时设置的域名
        '/api': {
          target: 'http://localhost:6060',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  }
})
