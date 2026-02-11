import App from './src/App.vue'
import { createSSRApp } from 'vue'
// 引入全局样式
import './src/assets/main.css'

export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}