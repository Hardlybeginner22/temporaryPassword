// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前云环境
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    // 查询用户信息
    const userResult = await db.collection('users').where({
      openid: wxContext.OPENID
    }).get()

    if (userResult.data.length === 0) {
      // 如果用户不存在，返回错误
      return {
        success: false,
        error: 'User not found'
      }
    }

    const user = userResult.data[0]

    // 格式化注册时间
    const registerTime = user.createdAt ? new Date(user.createdAt).toLocaleString() : '未知'

    // 返回用户信息
    return {
      success: true,
      data: {
        openId: wxContext.OPENID,
        registerTime: registerTime,
        // 可以根据需要返回更多用户信息
        nickName: user.userInfo ? user.userInfo.nickName : '未知',
        avatarUrl: user.userInfo ? user.userInfo.avatarUrl : '',
        // 添加其他您可能需要的用户信息字段
      }
    }

  } catch (err) {
    console.error('获取用户详情失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
