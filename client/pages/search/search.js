// pages/search/search.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.type == 'text') {
      console.log('search by text')
    } else {
      console.log('search by scan')
      this.searchByScan()
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  searchByText: function () {
    console.log("search by text")
  },

  searchByScan: function () {
    console.log("search by scan")

    var that = this
    wx.scanCode({
      success: function (res) {
        that.setData({
          result: res.result
        })
        console.log("scanCode result " + res.result)
        that.getBook(res.result)
      },
      fail: function (res) {
        if (res.errMsg !== 'scanCode:fail cancel') {
          util.showModel('扫描失败', res)
          console.log("scanCode fail " + res)
        }
      }
    })
  },

  getBook: function (isbn) {
    util.showBusy('已扫描，正在处理')

    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/book/isAdded`,
      login: false,
      method: 'POST',
      data: {
        isbn: isbn
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(result) {
        util.showSuccess('请求成功完成')
        if (result.data.code == 0) {
          console.log('get book success' + result.data.data.msg)
          wx.redirectTo({
            url: '../recording/recording?detail=' + isbn
          })
        } else {
          console.log('get book fail ', result.data.code);
          wx.hideToast();
          wx.showModal({
            title: '提示',
            content: '书库未录入此书，是否添加此书?',
            success: function (res) {
              if (res.confirm) {
                console.log('ok')
                wx.redirectTo({
                  url: '../recording/recording?isbn=' + isbn
                })
              } else if (res.cancel) {
                console.log('cancel')
              }
            }
          })
        }
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('get book request fail', error);
      }
    })
  }
})