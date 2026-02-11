import App from './App.vue'
import { createSSRApp } from 'vue'
// 引入全局样式
import './assets/main.css'

export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}