module.exports = {
  plugins: {
    'postcss-pxtorpx-pro': {
      rpxUnit: 0.5,
      selectorBlackList: [],
      propBlackList: [],
      replace: true
    },
    'postcss-custom-properties': {
      preserve: true
    }
  }
}
