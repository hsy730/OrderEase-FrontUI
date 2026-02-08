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
          <van-cell 
            v-for="category in product.option_categories || []" 
            :key="category.id"
            :title="getCategoryTitle(category)"
          >
            <template #right-icon>
              <div class="flex gap-2 flex-wrap justify-end">
                <van-tag 
                  v-for="option in category.options" 
                  :key="option.id"
                  :type="isOptionSelected(category.id, option.id) ? 'primary' : 'default'"
                  @click="handleOptionClick(category, option)"
                >
                  {{ option.name }}
                  <span v-if="option.price_adjustment > 0" class="ml-1">+¥{{ option.price_adjustment }}</span>
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
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import { getImageUrl } from '@/utils/image';

const props = defineProps({
  show: Boolean,
  product: Object
})

const emit = defineEmits(['update:show', 'add-to-cart'])

// 存储选中的选项，key为categoryId，value为选中的option数组
const selectedOptions = ref(new Map())

// 初始化默认选项
const initDefaultOptions = () => {
  console.log('初始化默认选项，当前产品:', props.product)
  selectedOptions.value.clear()
  
  if (!props.product?.option_categories) return
  
  for (const category of props.product.option_categories) {
    console.log('分类:', category.name, 'is_required:', category.is_required, 'is_multiple:', category.is_multiple, '选项数量:', category.options?.length || 0)
    
    // 只有必填且只有一个选项时，才自动勾选
    if (category.is_required && category.options && category.options.length === 1) {
      const defaultOption = category.options[0]
      console.log('必填且只有一个选项，自动勾选:', defaultOption)
      if (defaultOption) {
        selectedOptions.value.set(category.id, [defaultOption])
        console.log('已选中必填唯一选项:', defaultOption.name)
      }
    }
    // 其他情况（非必填、多个选项等）不设置默认值
  }
  console.log('初始化后选中的选项:', selectedOptions.value)
}

// 监听弹窗显示，初始化默认选项
watch(() => props.show, (newShow) => {
  if (newShow) {
    initDefaultOptions()
  }
})

const close = () => {
  emit('update:show', false)
}

// 获取分类标题
const getCategoryTitle = (category) => {
  let title = category.name
  if (category.is_required) {
    title += ' *'
  }
  return title
}

// 检查选项是否被选中
const isOptionSelected = (categoryId, optionId) => {
  const categoryOptions = selectedOptions.value.get(categoryId) || []
  return categoryOptions.some(o => o.id === optionId)
}

// 处理选项点击
const handleOptionClick = (category, option) => {
  console.log('点击选项:', option.name, '分类:', category.name, 'is_multiple:', category.is_multiple)
  if (category.is_multiple) {
    // 多选模式
    toggleMultipleOption(category.id, option)
  } else {
    // 单选模式
    selectSingleOption(category.id, option)
  }
  console.log('当前选中的选项:', selectedOptions.value)
}

// 单选
const selectSingleOption = (categoryId, option) => {
  selectedOptions.value.set(categoryId, [option])
}

// 多选
const toggleMultipleOption = (categoryId, option) => {
  let categoryOptions = selectedOptions.value.get(categoryId) || []
  const index = categoryOptions.findIndex(o => o.id === option.id)
  
  if (index > -1) {
    // 取消选择
    categoryOptions.splice(index, 1)
  } else {
    // 选择新项
    categoryOptions.push(option)
  }
  
  selectedOptions.value.set(categoryId, categoryOptions)
}

// 验证选项选择
const validateOptions = () => {
  console.log('开始校验选项')
  if (!props.product?.option_categories) {
    console.log('没有 option_categories，校验通过')
    return true
  }
  
  for (const category of props.product.option_categories) {
    const selected = selectedOptions.value.get(category.id) || []
    console.log('校验分类:', category.name, 'is_required:', category.is_required, '已选数量:', selected.length)
    
    // 检查必填项
    if (category.is_required && selected.length === 0) {
      console.log('校验失败，分类:', category.name, '未选择')
      showToast('此为必填项')
      return false
    }
  }
  
  console.log('校验通过')
  return true
}

const addToCart = () => {
  console.log('点击加入购物车')
  console.log('当前选中的选项:', selectedOptions.value)
  
  // 校验必填项
  if (!validateOptions()) {
    console.log('校验失败，拦截提交')
    return
  }
  
  console.log('校验通过，准备添加到购物车')
  
  // 构建规格数据
  const specifications = []
  for (const [categoryId, options] of selectedOptions.value.entries()) {
    const category = props.product.option_categories.find(c => c.id === categoryId)
    if (category && options && options.length > 0) {
      for (const option of options) {
        specifications.push({
          category: category.name,
          option: option.name,
          price_adjustment: option.price_adjustment || 0
        })
      }
    }
  }
  
  console.log('规格数据:', specifications)
  
  // 触发添加到购物车事件
  emit('add-to-cart', {
    product: props.product,
    specifications
  })
  
  // 清空选择
  selectedOptions.value.clear()
  
  close()
}
</script>
