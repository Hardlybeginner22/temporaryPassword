const app = getApp()

Page({
  data: {
    userInfo: null
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
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

  login(userInfo) {
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
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          })
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

  onLoad() {
    console.log('login page onLoad')
  },

  onShow() {
    console.log('login page onShow')
  }
})
