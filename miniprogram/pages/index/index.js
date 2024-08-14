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
    this.checkLoginStatus()
  },

  checkLoginStatus: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
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
      wx.showToast({
        title: '需要授权才能使用',
        icon: 'none'
      })
    }
  },

  navigateToCreatePass: function() {
    if (this.data.hasUserInfo) {
      wx.navigateTo({
        url: '../createPass/createPass',
        fail: function(err) {
          console.error('导航到创建密码页面失败', err);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    } else {
      this.showNeedLoginToast();
    }
  },
  
  navigateToCreatePass: function() {
    if (this.data.hasUserInfo) {
      wx.switchTab({
        url: '/pages/createPass/createPass',
        fail: function(err) {
          console.error('切换到创建密码页面失败', err);
          wx.showToast({
            title: '页面切换失败',
            icon: 'none'
          });
        }
      });
    } else {
      this.showNeedLoginToast();
    }
  },
  
  navigateToPassList: function() {
    if (this.data.hasUserInfo) {
      wx.switchTab({
        url: '/pages/passlist/passlist',
        fail: function(err) {
          console.error('切换到密码列表页面失败', err);
          wx.showToast({
            title: '页面切换失败',
            icon: 'none'
          });
        }
      });
    } else {
      this.showNeedLoginToast();
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
