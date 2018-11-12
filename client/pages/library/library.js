// pages/library/library.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var checkGroup = require('../../utils/checkGroup.js')

var appInstance = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    registered: appInstance.registered,
    offset: 0,
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (this.data.registered) {
      var query = {
        sortType: 'none',
        cnt: 10,
        offset: this.data.offset
      }
      this.getBooks(query)
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
        console.log("library share success " + res.shareTickets[0])
        checkGroup.checkGroup({
          shareTicket: res.shareTickets[0],
          success: function () {
            console.log("library share group success.")
          },
          fail: function () {
            console.log("library check group fail.")
          }
        })
      },
      fail: function (res) {
        console.log("library share group fail")
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.registered != appInstance.registered) {
      this.setData({
        registered: appInstance.registered
      })
    }

    if (this.data.registered) {
      var query = {
        sortType: 'none',
        cnt: 10,
        offset: this.data.offset
      }
      this.getBooks(query)
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
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

  getBooks: function (b) {
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/book/getBooks`,
      login: false,
      method: 'POST',
      data: b,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(result) {
        util.showSuccess('请求成功完成')
        console.log('add book done ' + result.data.data.msg)
        if (result.data.code == 0) {
          console.log('add book success')
          var booklist = that.getList(result.data.data.msg)
          that.setData({
            list: booklist
          })
        } else {
          console.log('add book fail', result.data.code);
        }
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  getList: function (msg) {
    var books = JSON.parse(msg);
    var items = new Array()
    var isOpen = true
    var title = "科学类图书(" + books.length + ")";
    items[0] = {
      id: 'reading',
      name: title,
      open: isOpen,
      books: books
    }

    return items
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
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }

    this.setData({
      list: list
    });
  }
})