<template>
  <view class="stepper">
    <view
      v-if="showMinus"
      class="stepper-btn minus"
      :class="{ disabled: modelValue <= min }"
      @click.stop="handleDecrement"
    >
      <view class="icon-minus"></view>
    </view>
    <view v-if="showMinus && modelValue > 0" class="stepper-input">
      {{ modelValue }}
    </view>
    <view
      class="stepper-btn plus"
      :class="{ disabled: modelValue >= max }"
      @click.stop="handleIncrement"
    >
      <view class="icon-plus"></view>
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
}

.icon-plus,
.icon-minus {
  width: 20rpx;
  height: 4rpx;
  border-radius: 2rpx;
  position: relative;
}

.icon-plus::before,
.icon-minus::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 2rpx;
}

.icon-plus::after {
  content: '';
  position: absolute;
  width: 4rpx;
  height: 20rpx;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 2rpx;
}

.stepper-btn.plus {
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
}

.stepper-btn.plus .icon-plus::before,
.stepper-btn.plus .icon-plus::after {
  background: #FFFFFF;
}

.stepper-btn.minus {
  background: #FFFFFF;
  border: 1rpx solid #1E40AF;
}

.stepper-btn.minus .icon-minus::before {
  background: #1E40AF;
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
