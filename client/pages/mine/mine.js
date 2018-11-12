// pages/mine/mine.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var checkGroup = require('../../utils/checkGroup.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
        console.log("mine share success " + res.shareTickets[0])
        checkGroup.checkGroup({
          shareTicket: res.shareTickets[0],
          success: function () {
            console.log("mine share group success.")
          },
          fail: function () {
            console.log("mine check group fail.")
          }
        })
      },
      fail: function (res) {
        console.log("mine share group fail")
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
  
  }
})