const app = getApp()

Page({
  data: {
    userInfo: null
  },

  getUserProfile: function() {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中
      success: (res) => {
        console.log('getUserProfile success:', res.userInfo)
        this.setData({
          userInfo: res.userInfo
        })
        this.login(res.userInfo)
      },
      fail: (err) => {
        console.error('获取用户信息失败', err)
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    })
  },

  login: function(userInfo) {
    wx.showLoading({
      title: '登录中...',
    })
  
    wx.cloud.callFunction({
      name: 'login',
      data: {
        userInfo: userInfo
      },
      success: res => {
        console.log('login success', res)
        if (res.result.success) {
          const updatedUserInfo = {
            ...userInfo,
            openId: res.result.openid,
            userId: res.result.userId,
            registerTime: res.result.registerTime
          }
          app.globalData.userInfo = updatedUserInfo
          app.globalData.openid = res.result.openid

          console.log('Updated globalData:', app.globalData)

          wx.hideLoading()
          wx.switchTab({
            url: '/pages/index/index'
          })
        } else {
          console.error('Login failed:', res)
          throw new Error('Login failed')
        }
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
  },

  onLoad: function() {
    console.log('login page onLoad')
  },

  onShow: function() {
    console.log('login page onShow')
  }
})
