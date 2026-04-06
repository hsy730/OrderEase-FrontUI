<script setup>
import { onLaunch as onAppLaunch, onShow as onAppShow, onHide as onAppHide } from '@dcloudio/uni-app'

onAppLaunch((options) => {
  console.log('=== App onLaunch 开始 ===')
  console.log('options:', options)
  console.log('=== App onLaunch 结束 ===')
})

onAppShow(() => {
  console.log('App Show')
})

onAppHide(() => {
  console.log('App Hide')
})
</script>

<style>
page {
  background-color: #f8f8f8;
}
</style>
