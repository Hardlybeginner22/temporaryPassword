Page({
  data: {
    passes: []
  },

  onShow() {
    this.getPassList()
  },

  getPassList() {
    wx.showLoading({
      title: '加载中...',
    })

    wx.cloud.callFunction({
      name: 'getTempPasses',
      success: res => {
        wx.hideLoading()
        if (res.result.success) {
          const passes = res.result.data.map(pass => {
            const expireTime = new Date(pass.expireTime)
            return {
              ...pass,
              expireTimeFormatted: expireTime.toLocaleString(),
              remainTime: this.formatRemainTime(expireTime)
            }
          })
          this.setData({ passes })
          this.startTimer()
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          title: '获取失败',
          icon: 'none'
        })
      }
    })
  },

  startTimer() {
    this.timer = setInterval(() => {
      const passes = this.data.passes.map(pass => {
        const expireTime = new Date(pass.expireTime)
        return {
          ...pass,
          remainTime: this.formatRemainTime(expireTime)
        }
      }).filter(pass => new Date(pass.expireTime) > new Date())
      this.setData({ passes })
    }, 1000)
  },

  formatRemainTime(expireTime) {
    const now = new Date()
    const diff = expireTime - now
    if (diff <= 0) return '已过期'
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${hours}时${minutes}分${seconds}秒`
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },

  // 新增删除密码的方法
  deletePass(event) {
    const { id } = event.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个临时密码吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...',
          })
          wx.cloud.callFunction({
            name: 'deleteTempPass',
            data: { id },
            success: res => {
              wx.hideLoading()
              if (res.result.success) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                this.getPassList() // 重新获取密码列表
              } else {
                wx.showToast({
                  title: '删除失败',
                  icon: 'none'
                })
              }
            },
            fail: err => {
              wx.hideLoading()
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  }
})
