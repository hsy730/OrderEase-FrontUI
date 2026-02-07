<template>
  <view
    class="uni-popup"
    :class="[popupClass, { 'uni-popup--show': showPopup }]"
    @click="onMaskClick"
  >
    <view
      class="uni-popup__wrapper"
      :class="['uni-popup--' + position]"
      @click.stop
    >
      <slot></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'UniPopup',
  props: {
    // 弹出层类型，可选值，top: 顶部弹出层；bottom：底部弹出层；center：居中弹出层
    type: {
      type: String,
      default: 'center'
    },
    // maskClick
    maskClick: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showPopup: false
    }
  },
  computed: {
    popupClass() {
      return `uni-popup--${this.type}`
    },
    position() {
      return this.type
    }
  },
  methods: {
    /**
     * 打开弹出层
     */
    open() {
      this.showPopup = true
      this.$emit('change', {
        show: true,
        type: this.type
      })
    },
    /**
     * 关闭弹出层
     */
    close() {
      this.showPopup = false
      this.$emit('change', {
        show: false,
        type: this.type
      })
    },
    onMaskClick() {
      if (this.maskClick) {
        this.close()
      }
    }
  }
}
</script>

<style scoped>
.uni-popup {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}

.uni-popup--show {
  opacity: 1;
  visibility: visible;
}

.uni-popup__wrapper {
  position: absolute;
  box-sizing: border-box;
}

.uni-popup--center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  transform: translate(-50%, -50%) scale(0.9);
  transition: transform 0.3s;
}

.uni-popup--show .uni-popup--center {
  transform: translate(-50%, -50%) scale(1);
}

.uni-popup--top {
  top: 0;
  left: 0;
  right: 0;
  transform: translateY(-100%);
  transition: transform 0.3s;
}

.uni-popup--show .uni-popup--top {
  transform: translateY(0);
}

.uni-popup--bottom {
  bottom: 0;
  left: 0;
  right: 0;
  transform: translateY(100%);
  transition: transform 0.3s;
  background-color: #fff;
  border-radius: 16rpx 16rpx 0 0;
}

.uni-popup--show .uni-popup--bottom {
  transform: translateY(0);
}
</style>
