<template>
  <div class="home">
    <van-nav-bar
      title="点餐系统"
      fixed
      :safe-area-inset-top="true"
    />
    
    <div class="content">
      <div class="menu-container">
        <div class="categories">
          <van-sidebar v-model="activeCategory">
            <van-sidebar-item 
              v-for="category in categories" 
              :key="category.id" 
              :title="category.name" 
            />
          </van-sidebar>
        </div>
        
        <div class="products">
          <van-card
            v-for="product in products"
            :key="product.id"
            :price="product.price"
            :title="product.name"
            :thumb="product.image"
          >
            <template #footer>
              <van-button 
                size="small" 
                type="primary" 
                @click="addToCart(product)"
              >
                加入购物车
              </van-button>
            </template>
          </van-card>
        </div>
      </div>
      
      <van-submit-bar
        :price="totalPrice * 100"
        button-text="提交订单"
        @submit="onSubmit"
      >
        <van-icon name="cart-o" size="20" :badge="cartItemCount" @click="showCart" />
      </van-submit-bar>
    </div>

    <!-- 购物车弹出层 -->
    <van-popup
      v-model:show="showCartPopup"
      position="bottom"
      round
      :style="{ height: '50%' }"
    >
      <cart-list 
        :items="cartItems"
        @update-quantity="updateCartItemQuantity"
        @remove="removeFromCart"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { showToast } from 'vant';
import CartList from '../components/CartList.vue';

const activeCategory = ref(0);
const categories = ref([]);
const products = ref([]);
const cartItems = ref([]);
const showCartPopup = ref(false);

// 计算购物车商品总数
const cartItemCount = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0);
});

// 计算总价
const totalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0);
});

// 添加到购物车
const addToCart = (product) => {
  const existingItem = cartItems.value.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.value.push({
      ...product,
      quantity: 1
    });
  }
  showToast('已添加到购物车');
};

// 显示购物车
const showCart = () => {
  showCartPopup.value = true;
};

// 提交订单
const onSubmit = () => {
  if (cartItems.value.length === 0) {
    showToast('购物车为空');
    return;
  }
  // TODO: 调用提交订单接口
};
</script>

<style scoped>
.home {
  padding-top: 46px;
}

.content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 46px);
}

.menu-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.categories {
  flex: 0 0 80px;
  background: #fff;
}

.products {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

:deep(.van-submit-bar) {
  bottom: constant(safe-area-inset-bottom);
  bottom: env(safe-area-inset-bottom);
}
</style> 