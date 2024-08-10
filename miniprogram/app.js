App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env:'stm32code-8g3chit120c4be2c',
        traceUser: true,
      })
    }

    this.globalData = {
      userInfo: null,
      openid: null
    }
  }
})
