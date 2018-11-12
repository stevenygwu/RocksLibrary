// pages/login/login.js
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
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("onLoad " + this.data.logged)
    if (!this.data.logged) {
      this.login();
    }
    wx.showShareMenu({
      withShareTicket: true
    })
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
    console.log("onShow " + this.data.logged)
    if (this.data.logged) {
      console.log("userInfo " + this.data.userInfo)
    }
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
        console.log("share success " + res.shareTickets[0])
        appInstance.shareTicket = res.shareTickets[0]
        //that.checkShareTicket()
        checkGroup.checkGroup({
          shareTicket: appInstance.shareTicket,
          success: function () {
            console.log("check group success.")
            appInstance.registered = true
            wx.switchTab({
              url: '../index/index'
            })
          },
          fail: function () {
            console.log("check group fail.")
          }
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  // 用户登录示例
  login: function () {
    if (this.data.logged) return

    util.showBusy('正在登录')
    var that = this

    // 调用登录接口
    qcloud.login({
      success(result) {
        if (result) {
          util.showSuccess('登录成功')
          that.setData({
            userInfo: result,
            logged: true
          })
          that.isRegistered();
        } else {
          // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
          qcloud.request({
            url: config.service.requestUrl,
            login: true,
            success(result) {
              util.showSuccess('登录成功')
              that.setData({
                userInfo: result.data.data,
                logged: true
              })
              appInstance.userInfo = result.data.data
              console.log("userInfo " + JSON.stringify(result.data.data));
              that.isRegistered();
            },

            fail(error) {
              util.showModel('请求失败', error)
              console.log('request fail', error)
            }
          })
        }
      },

      fail(error) {
        util.showModel('登录失败', error)
        console.log('登录失败', error)
      }
    })
  },

  isRegistered: function () {
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/register/isRegistered`,
      login: false,
      success(result) {
        util.showSuccess('请求成功完成')
        console.log('register status ' + result.data.data.msg)
        if (result.data.code == 0) {
          appInstance.registered = true
          //appInstance.list = that.getList(result.data.data.msg)
          wx.switchTab({
            url: '../index/index'
          })
        } else {
          console.log('user is unregistered', result.data.code);
          //maybe user open the app in group, so check the shareTicket.
          if (appInstance.shareTicket != null) {
            that.checkShareTicket()
          }
        }
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
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