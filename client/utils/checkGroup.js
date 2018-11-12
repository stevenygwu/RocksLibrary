var qcloud = require('../vendor/wafer2-client-sdk/index')
var config = require('../config')
var util = require('util.js')

var checkGroup = (c) => {
  wx.getShareInfo({
    shareTicket: c.shareTicket,
    complete(res) {
      console.log("complete " + res.errMsg + "encrypt data " + res.encryptedData)
      if (res.errMsg === 'getShareInfo:ok') {
        register({
          encryptedData: res.encryptedData,
          iv: res.iv,
          success() {
            c.success()
          },
          fail() {
            c.fail()
          }
        })
      } else {
        c.fail()
      }
    }
  })
}

var register = (r) => {
  util.showBusy('请求中...')
  qcloud.request({
    url: `${config.service.host}/weapp/register`,
    login: false,
    method: 'POST',
    data: {
      encryptedData: r.encryptedData,
      iv: r.iv
    },
    header: {
      'content-type': 'application/json' // 默认值
    },
    success(result) {
      if (result.data.code == 0) {
        util.showSuccess('请求成功完成')
        console.log("register success " + result.data.data.msg)
        r.success()
      } else {
        util.showSuccess('请求失败')
        console.log("register fail " + result.data.data.msg)
        r.fail()
      }
    },
    fail(error) {
      util.showModel('请求失败', error)
      console.log('request fail', error)
      r.fail()
    }
  })
}

module.exports = { checkGroup }
