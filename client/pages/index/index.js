//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var checkGroup = require('../../utils/checkGroup.js')
var HTMLParser = require('../../wxparse/htmlparser.js')

var appInstance = getApp()

Page({
    data: {
        registered: appInstance.registered,
        list: []
    },

    onLoad: function(options) {
      console.log("index onLoad registered " + this.data.registered)
      if (this.data.registered) {
        this.getList()
      }
      wx.showShareMenu({
        withShareTicket: true
      })
    },

    onShareAppMessage: function (options) {
      if (options.from === 'button') {
        console.log("onShareAppMessage from button")
        console.log(options.target)
      }
      var that = this
      return {
        title: 'rock\'s library',
        success: function (res) {
          // 转发成功
          console.log("index share success " + res.shareTickets[0])
          checkGroup.checkGroup({
            shareTicket: res.shareTickets[0],
            success: function () {
              console.log("index share group success.")
            },
            fail: function () {
              console.log("index check group fail.")
            }
          })
        },
        fail: function (res) {
          console.log("index share group fail")
        }
      }
    },

    onShow: function (options) {
      console.log("index onShow registered " + this.data.registered)
      if (appInstance.registered) {
        this.getUserDetail()
      }
      if (this.data.registered != appInstance.registered) {
        this.setData({
          registered: appInstance.registered
        })
      }
    },

    onReady: function () {
      console.log("index onReady registered " + this.data.registered)
      if (!appInstance.registered) {
        wx.navigateTo({
          url: '../login/login'
        })
      }
    },

    getUserDetail: function () {
      util.showBusy('请求中...')
      var that = this
      qcloud.request({
        url: `${config.service.host}/weapp/register/getUserDetail`,
        login: false,
        success(result) {
          if (result.data.code == 0) {
            util.showSuccess('请求成功完成')
            console.log("register success " + result.data.data.msg)
            var list = that.getList(result.data.data.msg)
            // that.setData({
            //   list: list
            // })
          } else {
            util.showSuccess('请求失败')
            console.log("register fail " + result.data.data.msg)
          }
        },
        fail(error) {
          util.showModel('请求失败', error)
          console.log('request fail', error)
        }
      })
    },

    getList: function (msg) {
      var udetail = JSON.parse(msg);
      var readbooks = JSON.parse(udetail.readbooks)
      var tobereadbooks = JSON.parse(udetail.tobereadbooks)

      var query = {
        readbooks: readbooks,
        tobereadbooks: tobereadbooks,
      }
      this.getUserBooks(query)
    },

    getUserBooks: function (q) {
      util.showBusy('请求中...')
      var isbns = new Array()
      var j = 0;
      for (var i = 0; i < q.readbooks.length; i++) {
        isbns[j++] = q.readbooks[i]
      }
      for (var i = 0; i < q.tobereadbooks.length; i++) {
        isbns[j++] = q.tobereadbooks[i]
      }

      var items = new Array()
      items[0] = {
        id: 'read',
        name: "已读书目(" + q.readbooks.length + ")",
        open: q.readbooks.length !== 0,
        books: []
      }

      items[1] = {
        id: 'toberead',
        name: "收藏的书目(" + q.tobereadbooks.length + ")",
        open: q.tobereadbooks.length !== 0,
        books: []
      }

      if (isbns.length === 0) {
        this.setData({
          list: items
        })
        return;
      }

      var that = this
      qcloud.request({
        url: `${config.service.host}/weapp/book/getBooksByIsbns`,
        login: false,
        method: 'POST',
        data: {
          isbns: isbns
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(result) {
          util.showSuccess('请求成功完成')
          console.log('get user book done ' + result.data.data.msg)
          var books = JSON.parse(result.data.data.msg);
          if (result.data.code == 0) {
            console.log('get user books success')
          } else {
            console.log('get user books fail', result.data.code);
          }

          var j = 0;
          for (var i = 0; i < q.readbooks.length; i++) {
            if (j >= books.length) {
              break;
            }
            items[0].books[i] = books[j++]
          }

          for (var i = 0; i < q.tobereadbooks.length; i++) {
            if (j >= books.length) {
              break;
            }
            items[1].books[i] = books[j++]
          }

          that.setData({
            list: items
          })
        },
        fail(error) {
          util.showModel('请求失败', error);
          console.log('request fail', error);
        }
      })
    },

    searchByText: function () {
      console.log("index searchByText")

      wx.navigateTo({
        url: '../search/search?type=text'
      })
    },

    searchByScan: function () {
      console.log("index searchByScan")
      wx.navigateTo({
        url: '../search/search?type=scan'
      })
    },

    showBookDetail: function (e) {
      var isbn = e.currentTarget.id
      console.log("showBookDetail isbn " + isbn)
      wx.navigateTo({
        url: '../recording/recording?detail=' + isbn
      })
    },

    listToggle: function (e) {
      console.log("index listToggle id " + e.currentTarget.id)
      var id = e.currentTarget.id,
      list = this.data.list
      for (var i = 0, len = list.length; i < len; ++i) {
        if (list[i].id == id && list[i].books.length !== 0) {
          list[i].open = !list[i].open 
        }
      }

      this.setData({ 
        list: list  
        });
    }
})
