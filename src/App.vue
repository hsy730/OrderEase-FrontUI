<script setup>
import { onLaunch as onAppLaunch, onShow as onAppShow, onHide as onAppHide } from '@dcloudio/uni-app'

onAppLaunch(() => {
  console.log('App Launch')
})

onAppShow(() => {
  console.log('App Show')
})

onAppHide(() => {
  console.log('App Hide')
})
</script>

<style>
/* 全局样式 */
@import '@/assets/main.css';

page {
  background-color: #f8f8f8;
}
</style>
