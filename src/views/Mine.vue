<template>
  <div class="mine-page">
    <!-- 用户信息 -->
    <div class="user-info bg-white p-4 mt-2 flex items-center">
      <van-image
        round
        width="64"
        height="64"
        src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
      />
      <div class="ml-4">
        <div class="text-lg font-bold">用户名</div>
        <div class="text-sm text-gray-500">手机号: 138****8888</div>
      </div>
    </div>

    <!-- 功能列表 -->
    <div class="function-list mt-3">
      <van-cell-group>
        <van-cell title="收货地址" is-link icon="location-o" />
        <van-cell title="联系电话" is-link icon="phone-o" />
        <van-cell title="账户设置" is-link icon="setting-o" />
        <van-cell title="关于我们" is-link icon="info-o" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.mine-page {
  min-height: calc(100vh - 50px);
  background: #f7f8fa;
  padding-bottom: 50px;
}
</style>