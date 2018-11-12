//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

App({
    onLaunch: function (ops) {
        qcloud.setLoginUrl(config.service.loginUrl)
        if (ops.scene == 1044) {
          console.log(ops.shareTicket)
          shareTicket = ops.shareTicket
        }
    },
    shareTicket: null,
    registered: false,
    userInfo: {}
})