const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  console.log('Creating temp password with data:', event)

  try {
    const { password, duration } = event
    const now = new Date()
    const expireTime = new Date(now.getTime() + duration * 60 * 60 * 1000)

    // 创建临时密码记录
    const result = await db.collection('temp_passwords').add({
      data: {
        userId: wxContext.OPENID,
        password: password,
        createTime: db.serverDate(),
        expireTime: expireTime,
        isValid: true,
        deviceSent: false
      }
    })

    console.log('Temp password created:', result)

    // 调用sendToDevice云函数
    const sendResult = await cloud.callFunction({
      name: 'sendToDevice',
      data: {
        password: password,
        expireTime: expireTime
      }
    })

    console.log('sendToDevice result:', sendResult)

    if (sendResult.result && sendResult.result.success) {
      // 更新deviceSent状态
      await db.collection('temp_passwords').doc(result._id).update({
        data: {
          deviceSent: true
        }
      })

      return {
        success: true,
        passwordId: result._id,
        deviceResponse: sendResult.result
      }
    } else {
      // 如果发送到设备失败，我们仍然保留密码记录，但标记为未发送到设备
      console.error('Failed to send to device:', sendResult)
      return {
        success: false,
        passwordId: result._id,
        error: 'Failed to send to device',
        deviceResponse: sendResult.result
      }
    }
  } catch (err) {
    console.error('Create temp password error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
