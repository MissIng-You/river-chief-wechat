/**
 * @fileOverview 问题详情 problem-detail 页面
 */

// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/wafer2-client-sdk/index');

// 引入配置
var config = require('../../config');

// 引入工具类
var utils = require('../../utils/index');

// 引入自定义封装的Wechat类
var wechat = require('../../utils/wechat');

// 引入自定义封装的Wechat类
var constants = require('../../utils/constants');

// 引入timeago.js 以及本地化包
var timeago = require('../../vendor/timeago.js/timeago');

// 映射“getProblemDetails”的字段
var mapFieldsOfGetProblemDetails = function (result) {
  var fields = {
    'Id': 'id',
    'ReplytPeopleId': 'replyId',
    'ReplyContent': 'content',
    'ReplyPeopleName': 'user',
    'CreateTime': 'timer',
    'ReportReplyFileList': 'attachments',
    'FileUrl': 'url'
  };

  var mapResult = utils.mapFields(result, fields);

  return mapResult;
};

// 声明问题详情页面
Page({

  // 数据项
  data: {
    // API
    getProblemDetails: config.service.getProblemDetails,

    // Navigation options
    id: undefined,
    wechatId: undefined,
    
    // 当前授权用户Id
    currentWechatId: undefined,

    // 当前问题项
    details: {},
    // details: {
    //   url: 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
    //   title: '[砥砺奋进.五周年]民间河长治水记.',
    //   user: 'Missing You',
    //   timer: '2017-10-24 23:23:23',
    //   tags: ['水体', '污染'],
    //   content: '[砥砺奋进.五周年]民间河长治水记.',
    //   address: '四川省 成都市 高新区 天府大道北段1700号 环球中心w5-13-05',
    //   // 附件信息
    //   attachments: [{
    //     id: 1,
    //     url: 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
    //     title: '[砥砺奋进.五周年]民间河长治水记.'
    //   }, {
    //     id: 2,
    //     url: 'http://pic.hsw.cn/0/13/09/09/13090929_929741.jpg',
    //     title: '[Follow Me Network] Middle.'
    //   }, {
    //     id: 3,
    //     url: 'http://photo.eastday.com/images/thumbnailimg/month_1601/201601230925571841.jpg',
    //     title: 'Dahsboard KB background.'
    //   }]
    // },

    // 处理详情
    solveDetails: [],
    // solveDetails: [{
    //   id: 1,
    //   url: 'http://photo.eastday.com/images/thumbnailimg/month_1601/201601230925571841.jpg',
    //   title: '[砥砺奋进.五周年]民间河长治水记.',
    //   address: '四川省 成都市 高新区 天府大道北段1700号 环球中心w5-13-05',
    //   tags: ['水体', '污染'],
    //   timer: '2017-10-22 12:34:23',
    //   attachments: [{
    //     id: 1,
    //     url: 'http://n.sinaimg.cn/hb/transform/20170717/cBEo-fyiavtv8781967.jpg',
    //     title: '[砥砺奋进.五周年]民间河长治水记.'
    //   }]
    // }],
  },

  // 预览图片
  preview(event) {
    wechat.preview(event);
  },

  // 获取问题项
  _getProblem(sessionKey) {
    var problemList = wx.getStorageSync(sessionKey);
    var curProblem = problemList && problemList.filter(item => item.id === this.data.id);
    console.log(curProblem);
    if (curProblem && curProblem.length >= 1) {
      this.setData({ details: curProblem[0] });
      return true;
    }
    return false;
  },

  getProblem() {
    // 先查找问题列表缓存，再查找我的问题列表缓存
    var isExistCurrentProblem = this._getProblem(constants.RCW_PROBLEM_LIST);
    if(!isExistCurrentProblem) {
      this._getProblem(constants.RCW_MY_PROBLEM_LIST);
    }
  },

  // 获取问题详情
  getProblemDetails() {
    var that = this;

    wechat.loading();

    qcloud.request({
      // 要请求的地址
      url: this.data.getProblemDetails,

      method: 'POST',

      data: utils.createAPIParams(that.data.id),

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      // login: true,

      success(result) {
        wechat.success('请求成功完成');
        console.log('request success', result);
        var problemDetails = mapFieldsOfGetProblemDetails(result.data.Data);
        var problemDetailsOfFormat = problemDetails && problemDetails.map(item => {
          var temp = item;
          temp.timer = timeago().format(item.timer, 'zh_CN');
          return temp;
        });
        that.setData({ solveDetails: problemDetailsOfFormat });
      },

      fail(error) {
        wechat.fail('请求失败', error);
        console.log('request fail', error);
      },

      complete() {
        console.log('request complete');
      }
    });
  },

  onLoad(options) {
    var user = wechat.getUserInfo();

    // 设置WechatId
    this.setData({
      id: options.id,
      wechatId: options.wechatId,
      currentWechatId: user && user.wechatId,
    });

    // 获取问题项
    setTimeout(this.getProblem, 0);

    // 获取问题详情
    setTimeout(this.getProblemDetails, 100);
  }
})