import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { 
  Button,
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
  CellGroup
} from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)

app.use(router)
   .use(Button)
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

app.mount('#app')
