const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad: function () {
    this.checkLoginStatus()
  },

  onShow: function () {
    // 每次页面显示时检查登录状态
    this.checkLoginStatus()
  },

  checkLoginStatus: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      // 如果没有用户信息,跳转到登录页面
      wx.redirectTo({
        url: '/pages/login/login'
      })
    }
  },

  getUserInfo: function(e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    } else {
      // 用户拒绝授权
      wx.showToast({
        title: '需要授权才能使用',
        icon: 'none'
      })
    }
  },

  navigateToCreatePass: function() {
    if (this.data.hasUserInfo) {
      wx.navigateTo({
        url: '/pages/createPass/createPass'
      })
    } else {
      this.showNeedLoginToast()
    }
  },

  navigateToPassList: function() {
    if (this.data.hasUserInfo) {
      wx.navigateTo({
        url: '/pages/passlist/passlist'
      })
    } else {
      this.showNeedLoginToast()
    }
  },

  showNeedLoginToast: function() {
    wx.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000
    })
  }
})
