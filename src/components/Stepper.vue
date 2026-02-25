<template>
  <view class="stepper">
    <view
      v-if="showMinus"
      class="stepper-btn minus"
      :class="{ disabled: modelValue <= min }"
      @click.stop="handleDecrement"
    >
      -
    </view>
    <view v-if="showMinus && modelValue > 0" class="stepper-input">
      {{ modelValue }}
    </view>
    <view
      class="stepper-btn plus"
      :class="{ disabled: modelValue >= max }"
      @click.stop="handleIncrement"
    >
      +
    </view>
  </view>
</template>

<script setup>
/**
 * @fileoverview 计数器组件
 * @module components/Stepper
 */

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 999
  },
  showMinus: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleIncrement = () => {
  if (props.modelValue >= props.max) return
  const newValue = props.modelValue + 1
  emit('update:modelValue', newValue)
  emit('change', { value: newValue, delta: 1 })
}

const handleDecrement = () => {
  if (props.modelValue <= props.min) return
  const newValue = props.modelValue - 1
  emit('update:modelValue', newValue)
  emit('change', { value: newValue, delta: -1 })
}
</script>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stepper-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
}

.stepper-btn.plus {
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  color: #FFFFFF;
}

.stepper-btn.minus {
  background: #FFFFFF;
  color: #1E40AF;
  border: 1rpx solid #1E40AF;
}

.stepper-btn.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.stepper-input {
  width: 48rpx;
  text-align: center;
  font-size: 26rpx;
  color: #0F172A;
}
</style>
