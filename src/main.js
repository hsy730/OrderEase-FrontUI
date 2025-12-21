import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { 
  Button,
  Popup,
  Tabbar,
  TabbarItem,
  Icon,
  Sidebar,
  SidebarItem,
  NavBar,
  Image as VanImage,
  Stepper,
  Badge,
  Card,
  Tag,
  Cell,
  CellGroup,
  Form,
  Field,
  Toast
} from 'vant'
import 'vant/lib/index.css'

// 引入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

app.use(router)
   .use(Button)
   .use(Popup)
   .use(Tabbar)
   .use(TabbarItem)
   .use(Icon)
   .use(Sidebar)
   .use(SidebarItem)
   .use(NavBar)
   .use(VanImage)
   .use(Stepper)
   .use(Badge)
   .use(Card)
   .use(Tag)
   .use(Cell)
   .use(CellGroup)
   .use(Form)
   .use(Field)
   .use(Toast)
   // 注册Element Plus
   .use(ElementPlus)

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
