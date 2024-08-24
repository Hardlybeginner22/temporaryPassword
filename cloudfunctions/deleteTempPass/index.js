const cloud = require('wx-server-sdk')
const request = require('request-promise')

cloud.init()

const ALICLOUD_SERVER_URL = 'http://47.108.231.34:3000/deleteTempPassword'

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  console.log('Attempting to delete temp password with id:', event.id)

  try {
    // 检查密码是否属于当前用户
    const password = await db.collection('temp_passwords').doc(event.id).get()
    
    if (password.data.userId !== wxContext.OPENID) {
      console.error('User not authorized to delete this password')
      return {
        success: false,
        error: 'Not authorized to delete this password'
      }
    }

    // 删除密码
    const result = await db.collection('temp_passwords').doc(event.id).remove()

    console.log('Delete operation result:', result)

    if (result.stats.removed === 1) {
      // 同步删除操作到阿里云服务器
      try {
        console.log('Syncing delete operation to Alicloud server...')
        const serverResponse = await request({
          url: ALICLOUD_SERVER_URL,
          method: 'GET',
          qs: {
            password: password.data.password
          },
          json: true,
          timeout: 10000 // 10 seconds timeout
        })

        console.log('Server response:', serverResponse)

        if (serverResponse && serverResponse.success) {
          console.log('Password deletion synced to server successfully')
        } else {
          console.warn('Server did not confirm successful deletion:', serverResponse)
        }
      } catch (serverError) {
        console.error('Error syncing deletion to server:', serverError)
        // 记录错误，但不影响整体删除操作的成功状态
      }

      return { 
        success: true,
        message: 'Password deleted successfully'
      }
    } else {
      console.error('Delete operation did not remove any document')
      return { 
        success: false, 
        error: 'Password not found or already deleted'
      }
    }
  } catch (err) {
    console.error('Error in delete operation:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
