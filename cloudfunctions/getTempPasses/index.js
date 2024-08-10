const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  try {
    const now = db.serverDate()
    const result = await db.collection('temp_passwords')
      .where({
        userId: wxContext.OPENID,
        expireTime: db.command.gt(now),
        isValid: true
      })
      .orderBy('createTime', 'desc')
      .get()

    // 格式化日期并计算剩余时间
    const formattedResult = result.data.map(pass => {
      const expireTime = new Date(pass.expireTime)
      const remainingTime = expireTime - new Date()
      return {
        ...pass,
        expireTimeFormatted: expireTime.toLocaleString(),
        remainingTimeInSeconds: Math.max(0, Math.floor(remainingTime / 1000))
      }
    })

    return {
      success: true,
      data: formattedResult
    }
  } catch (err) {
    console.error('Get temp passes error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
