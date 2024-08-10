const cloud = require('wx-server-sdk')
cloud.init()

// 引入 TCP 客户端库
const net = require('net')

// 门禁设备的 IP 地址和端口
const DEVICE_IP = '192.168.1.100'
const DEVICE_PORT = 8080

// 最大重试次数
const MAX_RETRIES = 3

// 发送数据到设备并等待响应
function sendToDeviceAndWaitResponse(data) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket()
    let retries = 0

    const tryConnect = () => {
      client.connect(DEVICE_PORT, DEVICE_IP, () => {
        console.log('Connected to device')
        client.write(JSON.stringify(data))
      })
    }

    client.on('data', (response) => {
      console.log('Received response:', response.toString())
      client.destroy()
      try {
        const jsonResponse = JSON.parse(response.toString())
        resolve(jsonResponse)
      } catch (error) {
        reject(new Error('Invalid response format'))
      }
    })

    client.on('close', () => {
      console.log('Connection closed')
    })

    client.on('error', (err) => {
      console.error('Connection error:', err)
      if (retries < MAX_RETRIES) {
        retries++
        console.log(`Retrying... (${retries}/${MAX_RETRIES})`)
        setTimeout(tryConnect, 2000) // 2秒后重试
      } else {
        reject(new Error('Failed to connect to device after multiple attempts'))
      }
    })

    tryConnect()
  })
}

exports.main = async (event, context) => {
  const { password, expireTime } = event

  try {
    // 构造发送到设备的数据
    const deviceData = {
      cmd: 'add_password',
      password: password,
      expire_time: new Date(expireTime).toISOString()
    }

    // 发送数据到设备并等待响应
    const response = await sendToDeviceAndWaitResponse(deviceData)

    if (response.status === 'success') {
      return {
        success: true,
        message: 'Password sent to device successfully',
        deviceResponse: response
      }
    } else {
      throw new Error('Device returned an error: ' + response.message)
    }
  } catch (err) {
    console.error('Error in sendToDevice:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
