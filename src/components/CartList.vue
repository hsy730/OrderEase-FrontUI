<template>
  <div class="cart-list">
    <div class="header">
      <van-nav-bar title="购物车" />
    </div>
    
    <div class="items">
      <van-swipe-cell v-for="item in items" :key="item.id">
        <van-card
          :price="item.price"
          :title="item.name"
          :thumb="item.image"
        >
          <template #footer>
            <van-stepper
              v-model="item.quantity"
              @change="(value) => updateQuantity(item, value)"
            />
          </template>
        </van-card>
        <template #right>
          <van-button
            square
            text="删除"
            type="danger"
            class="delete-button"
            @click="remove(item)"
          />
        </template>
      </van-swipe-cell>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update-quantity', 'remove']);

const updateQuantity = (item, value) => {
  emit('update-quantity', item, value);
};

const remove = (item) => {
  emit('remove', item);
};
</script>

<style scoped>
.cart-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.items {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.delete-button {
  height: 100%;
}
</style> 