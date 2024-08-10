const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  try {
    // 检查用户是否已存在
    const userCollection = db.collection('users')
    const user = await userCollection.where({
      openid: wxContext.OPENID
    }).get()

    if (user.data.length === 0) {
      // 如果用户不存在,创建新用户
      await userCollection.add({
        data: {
          openid: wxContext.OPENID,
          createdAt: db.serverDate(),
          lastLoginAt: db.serverDate()
        }
      })
    } else {
      // 更新最后登录时间
      await userCollection.where({
        openid: wxContext.OPENID
      }).update({
        data: {
          lastLoginAt: db.serverDate()
        }
      })
    }

    return {
      success: true,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
    }
  } catch (err) {
    console.error('Login error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
