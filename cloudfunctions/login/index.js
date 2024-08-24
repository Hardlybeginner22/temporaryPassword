const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const { avatarUrl, nickname } = event.userInfo

  try {
    const userCollection = db.collection('users')
    let user = await userCollection.where({
      openid: wxContext.OPENID
    }).get()

    let userId, registerTime

    if (user.data.length === 0) {
      // 如果用户不存在，创建新用户
      const result = await userCollection.add({
        data: {
          openid: wxContext.OPENID,
          avatarUrl: avatarUrl,
          nickname: nickname,
          createdAt: db.serverDate(),
          lastLoginAt: db.serverDate()
        }
      })
      userId = result._id
      registerTime = new Date().toISOString() // 使用当前时间作为注册时间
    } else {
      // 更新用户信息和最后登录时间
      userId = user.data[0]._id
      registerTime = user.data[0].createdAt
      await userCollection.doc(userId).update({
        data: {
          avatarUrl: avatarUrl,
          nickname: nickname,
          lastLoginAt: db.serverDate()
        }
      })
    }

    return {
      success: true,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
      avatarUrl: avatarUrl,
      nickname: nickname,
      userId: userId,
      registerTime: registerTime
    }
  } catch (err) {
    console.error('Login error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
