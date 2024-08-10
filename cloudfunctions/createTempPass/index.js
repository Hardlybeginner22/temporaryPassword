const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log('Function started with event:', event)
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  try {
    const { password, duration } = event
    
    // 输入验证
    if (!password || !duration || password.length !== 6 || isNaN(duration)) {
      throw new Error('Invalid input: password must be 6 digits and duration must be a number')
    }

    const now = new Date()
    const expireTime = new Date(now.getTime() + duration * 60 * 60 * 1000)

    // 创建临时密码记录
    const result = await db.collection('temp_passwords').add({
      data: {
        userId: wxContext.OPENID,
        password,
        createTime: db.serverDate(),
        expireTime,
        isValid: true,
        deviceSent: false
      }
    })

    console.log('Password created, id:', result._id)

    // 异步发送到设备，不等待结果
    cloud.callFunction({
      name: 'sendToDevice',
      data: { password, expireTime: expireTime.toISOString() }
    }).then(sendResult => {
      if (sendResult.result && sendResult.result.success) {
        // 更新deviceSent状态
        return db.collection('temp_passwords').doc(result._id).update({
          data: { deviceSent: true }
        })
      } else {
        console.error('Failed to send to device:', sendResult)
        // 考虑是否要在这里删除密码记录
      }
    }).catch(error => {
      console.error('Error sending to device:', error)
    })

    return {
      success: true,
      passwordId: result._id
    }
  } catch (error) {
    console.error('Error in createTempPass:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
