const app = getApp()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad: function() {
    // 查看是否授权
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: (res) => {
              this.setData({
                userInfo: res.userInfo
              })
              this.login()
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      // 用户按了允许授权按钮
      this.setData({
        userInfo: e.detail.userInfo
      })
      this.login()
    } else {
      // 用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击了"返回授权"')
          }
        }
      })
    }
  },

  login: function() {
    wx.showLoading({
      title: '登录中...',
    })

    wx.login({
      success: res => {
        if (res.code) {
          // 调用云函数
          wx.cloud.callFunction({
            name: 'login',
            data: {
              code: res.code
            },
            success: res => {
              console.log('login success', res)
              app.globalData.userInfo = this.data.userInfo
              app.globalData.openid = res.result.openid
              wx.hideLoading()
              wx.switchTab({
                url: '/pages/index/index'
              })
            },
            fail: err => {
              console.error('login fail', err)
              wx.hideLoading()
              wx.showToast({
                title: '登录失败',
                icon: 'none'
              })
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
          wx.hideLoading()
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          })
        }
      }
    })
  }
})
