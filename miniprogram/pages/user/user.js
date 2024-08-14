// user.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false
  },

  onLoad: function () {
    this.updateUserInfo()
  },

  onShow: function () {
    this.updateUserInfo()
  },

  updateUserInfo: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      console.log('Current user info:', this.data.userInfo)
    } else {
      console.log('No user info found in globalData')
      wx.redirectTo({
        url: '/pages/login/login'
      })
    }
  },

  getUserProfile: function() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        let userInfo = {
          ...app.globalData.userInfo,
          ...res.userInfo
        }
        app.globalData.userInfo = userInfo
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })
        console.log('Updated user info:', this.data.userInfo)
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

  logout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要登出吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.userInfo = null
          app.globalData.openid = null
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }
      }
    })
  },

  formatDate: function(dateString) {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
})
