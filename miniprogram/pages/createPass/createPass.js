Page({
  data: {
    password: '',
    duration: 1
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },

  onDurationInput(e) {
    this.setData({
      duration: parseInt(e.detail.value)
    })
  },

  createPassword() {
    if (this.data.password.length !== 6) {
      wx.showToast({
        title: '请输入6位数字密码',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '创建中...',
    })

    wx.cloud.callFunction({
      name: 'createTempPass',
      data: {
        password: this.data.password,
        duration: this.data.duration
      },
      success: res => {
        wx.hideLoading()
        if (res.result.success) {
          wx.showToast({
            title: '创建成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          wx.showToast({
            title: '创建失败1',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('Cloud function call failed:', err)
        wx.hideLoading()
        wx.showToast({
          title: '创建失败: ' + err.errMsg,
          icon: 'none'
        })
      }
    })
  }
})
