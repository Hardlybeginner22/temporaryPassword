const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }
  },

  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  logout: function() {
    // 实现登出逻辑
    wx.showModal({
      title: '提示',
      content: '确定要登出吗？',
      success (res) {
        if (res.confirm) {
          // 清除用户信息
          app.globalData.userInfo = null
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }
      }
    })
  }
})
