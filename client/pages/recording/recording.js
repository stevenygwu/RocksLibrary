// pages/recording/recording.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var checkGroup = require('../../utils/checkGroup.js')
var HTMLParser = require('../../wxparse/htmlparser.js')

var appInstance = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bBookReady: false,
    bReadOnly: false,
    img: '',
    title: '',
    author: '',
    isbn: '',
    imgUrl: '',
    ebookUrl: '',
    state: 0,
    statesArray: ['idle', 'reading', 'lost'],
    category: 0,
    categoryArray: ['科学', '历史', '人文'],
    score: 50,
    summary: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("recording isbn=" + options.isbn)
    wx.showShareMenu({
      withShareTicket: true
    })

    if (options.isbn !== undefined) {
      this.addBookByScan(options.isbn)
      this.data.isbn = options.isbn
      return
    }
    if (options.detail !== undefined) {
      this.data.isbn = options.detail
      this.getBook(options.detail)
      this.setData({
        bReadOnly: true
      })
      return
    }

    console.log("error recording no correct params found!")
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
        console.log("recording share success " + res.shareTickets[0])
        checkGroup.checkGroup({
          shareTicket: res.shareTickets[0],
          success: function () {
            console.log("recording share group success.")
          },
          fail: function () {
            console.log("recording check group fail.")
          }
        })
      },
      fail: function (res) {
        console.log("recording share group fail")
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
  
  },

  addBookByScan: function (isbn) {
    util.showBusy('获取图书信息...')

    var that = this
    wx.request({
      //url: 'https://api.douban.com/v2/book/isbn/:'+isbn,
      //url: 'https://isbndb.com/search/books/' + isbn,
      url: 'https://isbndb.com/book/' + isbn,
      success: function (res) {
        util.showSuccess('请求成功')
        that.parserBook(res.data)
      },
      fail: function (error) {
        util.showModel('请求失败', error)
        console.log('recording book fail ', error)
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },

  parserBook: function (data) {
    var bFoundContent = false
    var bFoundImg = false
    var bFoundTitle = false
    var bFoundAuthors = false
    var bGetTitle = false
    var bGetAuthor = false
    var count = 0 //count the start and end.
    var book = {
      img: '',
      title: '',
      author: '',
      isbn: ''
    }

    book.isbn = this.data.isbn;

    var that = this
    HTMLParser(data, {
      start: function (tag, attrs, unary) {
        //console.log("HTMLParser start " + tag + " " + attrs + " " +unary);
        for (var i = 0; i < attrs.length; i++) {
          //console.log ("attrs " + attrs[i].name + " " + attrs[i].value + " " + attrs[i].src)
          if (attrs[i].name == 'id' && attrs[i].value == 'block-multipurpose-business-theme-content') {
            console.log("HTMLParser content read start");
            bFoundContent = true;
          }
          if (bFoundContent) {
            if (attrs[i].name == 'type' && attrs[i].value == 'image/png' && !bFoundImg) {
              console.log('got image: ' + attrs[i - 1].value)
              book.img = attrs[i - 1].value
              bFoundImg = true
            }

            if (attrs[i].name == 'href' && bFoundAuthors) {
              bGetAuthor = true
              bFoundAuthors = false
            }
          }
        }
        if (bFoundContent) {
          count++;
          if (tag == 'td' && bFoundTitle) {
            bGetTitle = true
            bFoundTitle = false
          }
        }
      },
      end: function (tag) {
        //console.log("HTMLParser end " + tag);
        if (bFoundContent) {
          count--;
          if (count === 0) {
            console.log("HTMLParser content read done");
            bFoundContent = false;
          }
        }
      },
      chars: function (text) {
        //console.log("HTMLParser chars " + text);
        if (bFoundContent) {
          if (text == 'Full Title') {
            bFoundTitle = true;
          }

          if (text == 'Authors') {
            bFoundAuthors = true
          }

          if (bGetTitle) {
            console.log('got the book title: ' + text)
            bGetTitle = false
            book.title = text
          }

          if (bGetAuthor) {
            console.log('got the book Authors: ' + text)
            bGetAuthor = false
            book.author = text
          }
        }
      },
      comment: function (text) {
        //console.log("HTMLParser comment " + text);
      },
    });

    console.log('parser finished ' + bFoundContent)

    that.setData({
      bBookReady: true,
      img: book.img,
      title: book.title,
      author: book.author,
      isbn: book.isbn
    })
  },

  addBook: function (b) {
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/book/addBook`,
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
        } else {
          console.log('add book fail', result.data.code);
        }
        wx.navigateBack({
          delta: 1
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },

  bindStateChange: function (e) {
    this.setData({
      state: e.detail.value
    })
  },

  bindCategoryChange: function (e) {
    this.setData({
      category: e.detail.value
    })
  },

  scoreChange: function (e) {
    this.setData({
      score: e.detail.value
    })
  },

  doUploadEbook: function () {
    console.log('ebook is under construction.')
    if (this.data.bReadOnly) {
      console.log('read only')
      return;
    }
  },

  doUploadImage: function () {
    if (this.data.bReadOnly) {
      console.log('read only')
      return;
    }
    
    var that = this

    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        util.showBusy('正在上传')
        var filePath = res.tempFilePaths[0]

        // 上传图片
        wx.uploadFile({
          url: config.service.uploadUrl,
          filePath: filePath,
          name: 'file',

          success: function (res) {
            util.showSuccess('上传图片成功')
            res = JSON.parse(res.data)
            that.setData({
              imgUrl: res.data.imgUrl
            })
          },

          fail: function (e) {
            util.showModel('上传图片失败')
          }
        })

      },
      fail: function (e) {
        console.error(e)
      }
    })
  },

  formSubmit: function (e) {
    console.log('form submit：', e.detail.value)
    var book = {
      title: this.data.title,
      summary: e.detail.value.Summary,
      author: this.data.author,
      img: this.data.img,
      isbn: this.data.isbn,
      state: this.data.statesArray[this.data.state],
      score: this.data.score,
      imgUrl: this.data.imgUrl,
      ebooksrc: this.data.ebookUrl
    }

    this.addBook(book)
  },

  getBook: function (isbn) {
    util.showBusy('获取图书信息')

    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/book/getBook`,
      login: false,
      method: 'POST',
      data: {
        isbn: isbn
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(result) {
        if (result.data.code == 0) {
          util.showSuccess('请求成功完成')
          console.log('get book success' + result.data.data.msg)
          var book = JSON.parse(result.data.data.msg)
          var state = 0
          for (var i = 0; i < that.data.statesArray.length; i++) {
            if (that.data.statesArray[i] === book.state) {
              state = i
              break
            }
          }

          var bOwner = book.owner == appInstance.userInfo.openId
          that.setData({
            bBookReady: true,
            img: book.img,
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            //ebookUrl: book.ebookUrl,
            imgUrl: book.imgUrl,
            state: state,
            score: book.score,
            summary: book.summary,
            bReadOnly: !bOwner
          })
        } else {
          console.log('get book fail ', result.data.code);
          util.showModel('请求失败', result.data.data.msg);
          wx.navigateBack({
            delta: 1
          })
        }
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('get book request fail', error);
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },
  collect: function() {
    console.log("collect")
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/register/collect`,
      login: false,
      method: 'POST',
      data: {
        isbn: that.data.isbn
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(result) {
        util.showSuccess('请求成功完成')
        console.log('collect result ' + result.data.data.msg)
        if (result.data.code == 0) {
        } else {
          console.log('collect fail', result.data.code);
        }
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('collect fail', error);
      }
    })
  } 
})