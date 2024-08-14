const cloud = require('wx-server-sdk')
cloud.init()

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
