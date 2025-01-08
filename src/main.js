import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Button, Card, SubmitBar, Popup, NavBar, Sidebar, SidebarItem, Icon, Toast } from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)

// 注册路由
app.use(router)

// 注册 Vant 组件
app.use(Button)
   .use(Card)
   .use(SubmitBar)
   .use(Popup)
   .use(NavBar)
   .use(Sidebar)
   .use(SidebarItem)
   .use(Icon)
   .use(Toast)

app.mount('#app')
