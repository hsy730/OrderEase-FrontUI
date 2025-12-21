<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    round
    :style="{ height: '70%' }"
  >
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold">{{ product.name }}</h3>
        <van-icon name="cross" @click="close" />
      </div>
      
      <div class="product-info mb-4">
        <SmartImage 
          :src="getImageUrl(product.image)" 
          :className="'w-full h-40 object-cover rounded-lg'"
        />
        <div class="mt-2">
          <div class="text-[#C3A87C] text-xl">¥{{ product.price }}</div>
          <div class="text-sm text-gray-500 mt-1">{{ product.description }}</div>
        </div>
      </div>

      <!-- 规格选择 -->
      <div class="specifications">
        <h4 class="font-bold mb-2">规格</h4>
        <van-cell-group>
          <van-cell title="温度">
            <template #right-icon>
              <div class="flex gap-2">
                <van-tag 
                  v-for="temp in temperatures" 
                  :key="temp"
                  :type="selectedTemp === temp ? 'primary' : 'default'"
                  @click="selectedTemp = temp"
                >
                  {{ temp }}
                </van-tag>
              </div>
            </template>
          </van-cell>
          <van-cell title="糖度">
            <template #right-icon>
              <div class="flex gap-2">
                <van-tag 
                  v-for="sugar in sugarLevels" 
                  :key="sugar"
                  :type="selectedSugar === sugar ? 'primary' : 'default'"
                  @click="selectedSugar = sugar"
                >
                  {{ sugar }}
                </van-tag>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 添加到购物车按钮 -->
      <div class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <van-button type="primary" block color="#C3A87C" @click="addToCart">
          加入购物车
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref } from 'vue'
import { getImageUrl } from '@/utils/image';

const props = defineProps({
  show: Boolean,
  product: Object
})

const emit = defineEmits(['update:show'])

const selectedTemp = ref('常温')
const selectedSugar = ref('标准糖')

const temperatures = ['常温', '热', '去冰', '少冰']
const sugarLevels = ['无糖', '微糖', '半糖', '标准糖']

const close = () => {
  emit('update:show', false)
}

const addToCart = () => {
  // TODO: 实现添加到购物车的逻辑
  close()
}
</script>