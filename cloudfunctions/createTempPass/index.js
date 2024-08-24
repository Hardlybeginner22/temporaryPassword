const cloud = require('wx-server-sdk');
const request = require('request-promise');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const ALICLOUD_SERVER_URL = 'http://47.108.231.34:3000/setTempPassword';

exports.main = async (event, context) => {
  console.log('Function started with event:', event);
  const wxContext = cloud.getWXContext();
  const db = cloud.database();

  try {
    const { password, duration } = event;
    
    // 输入验证
    if (!password || !duration || password.length !== 6 || isNaN(duration)) {
      throw new Error('Invalid input: password must be 6 digits and duration must be a number');
    }

    const now = new Date();
    const expireTime = new Date(now.getTime() + duration * 60 * 60 * 1000);

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
    });

    console.log('Password created in database, id:', result._id);

    // 发送密码到阿里云服务器
    console.log('Attempting to send password to Alicloud server...');
    try {
      const serverResponse = await request({
        url: ALICLOUD_SERVER_URL,
        method: 'GET',
        qs: {
          password: password,
          expireTime: expireTime.getTime()
        },
        json: true,
        timeout: 10000 // 10 seconds timeout
      });

      console.log('Server response:', serverResponse);

      if (serverResponse && serverResponse.success) {
        // 更新deviceSent状态
        await db.collection('temp_passwords').doc(result._id).update({
          data: { deviceSent: true }
        });
        console.log('Password sent to server successfully');
      } else {
        console.error('Failed to send to server:', serverResponse);
        throw new Error('Server did not return success');
      }
    } catch (serverError) {
      console.error('Error sending to server:', serverError);
      // 记录更详细的错误信息
      if (serverError.error) {
        console.error('Detailed error:', serverError.error);
      }
      throw new Error(`Failed to send password to server: ${serverError.message}`);
    }

    return {
      success: true,
      passwordId: result._id,
      message: 'Password created and sent to server'
    };
  } catch (error) {
    console.error('Error in createTempPass:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
