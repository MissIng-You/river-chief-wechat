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

// 映射“getRanks”的字段
var mapFieldsOfGetUserInfo = function (result) {
  var fields = {
    'Id': 'id',
    'OpenId': 'openId',
    'Nickname': 'user',
    'Sex': 'gender',
    'HeadUrl': 'url',
    'Rank': 'rank',
    'IsAmb': 'isVip',
    'Country': 'country',
    'Province': 'province',
    'City': 'city',
    'CurMonthCount': 'pollingCount'
  };

  var mapResult = utils.mapFields(result, fields);

  return mapResult;
};

// 映射“getRivers”的字段
var mapFieldsOfGetRivers = function (result) {
  var fields = {
    'RiverBaseInfoId': 'id',
    'RiverName': 'riverName',
    'ReachName': 'reachName'
  };

  var mapResult = utils.mapFields(result, fields);

  return mapResult;
};

// 映射“getMyProblems”的字段
var mapFieldsOfGetMyProblems = function (result) {
  var fields = {
    'Id': 'id',
    'WeChatUserId': 'wechatId',
    'Nickname': 'user',
    'FullAddress': 'address',
    'QuestionDescribe': 'describe',
    'RiverName': 'title',
    'CreateTime': 'timer',
    'FileList': 'attachments',
    'FileUrl': 'url'
  };

  var mapResult = utils.mapFields(result, fields);

  console.log('map fields: %o', mapResult);

  return mapResult;
}

// 声明用户账号信息页面
Page({

  // 声明数据项
  data: {
    // API
    getUserInfo: config.service.getUserInfo,
    getRivers: config.service.getRivers,
    getMyProblems: config.service.getMyProblems,

    // Navigation options
    wechatId: undefined,

    // 用户信息
    userInfo: {},
    // userInfo: {
    //   rank: '289',
    //   user: '王欢',
    //   province: '四川省',
    //   city: '成都市',
    //   pollingCount: '1096',
    //   url: 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
    // },

    // 河流信息
    rivers: [],
    // rivers: [{
    //   id: 1,
    //   riverName: '雅砻江',
    //   reachName: '甘孜州雅砻江赠曲河李家河段'
    // }, {
    //   id: 2,
    //   riverName: '赠曲河',
    //   reachName: '甘孜州雅砻江赠曲河李家河段'
    // }, {
    //   id: 3,
    //   riverName: '宋曲河',
    //   reachName: '甘孜州雅砻江赠曲河李家河段'
    // }],

    // 热门问题
    pollingTops: [],
    // pollingTops: [{
    //   id: 1,
    //   user: 'Missing - You',
    //   url: 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
    //   title: '[砥砺奋进.五周年]民间河长治水记.',
    //   address: '四川省 成都市 高新区 天府大道北段1700号 环球中心w5-13-05',
    //   tags: ['水体', '污染'],
    //   describe: '水体;河道|大坝;河道大坝存在异常',
    //   timer: '2017-10-22 12:34:23'
    // }],
  },

  // 获取用户账户信息
  getUserInfo() {
    var that = this;

    if (!that.data.wechatId) return;

    wechat.loading();

    qcloud.request({
      // 要请求的地址
      url: this.data.getUserInfo,

      method: 'POST',

      data: utils.createAPIParams(that.data.wechatId),

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      // login: true,

      success(result) {
        wechat.success('请求成功完成');
        console.log('request success', result);
        that.setData({ userInfo: mapFieldsOfGetUserInfo(result.data.Data) });

        // 获取我管理的河流
        setTimeout(that.getRivers, 100);

        // 获取我的/Ta的问题
        setTimeout(that.getMyProblems, 100);
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

  // 获取我管理的河流
  getRivers() {
    var that = this;

    wechat.loading();

    qcloud.request({
      // 要请求的地址
      url: this.data.getRivers,

      method: 'POST',

      data: utils.createAPIParams(that.data.wechatId),

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      // login: true,

      success(result) {
        wechat.success('请求成功完成');
        console.log('request success', result);
        that.setData({ rivers: mapFieldsOfGetRivers(result.data.Data) });
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

  // 获取我的/Ta的问题
  getMyProblems() {
    var that = this;

    if (!that.data.wechatId) return;

    wechat.loading();

    qcloud.request({
      // 要请求的地址
      url: this.data.getMyProblems,

      method: 'POST',

      data: utils.createAPIParams({
        WeChatUserId: that.data.wechatId,
        PageSize: Infinity
      }),

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      // login: true,

      success(result) {
        wechat.success('请求成功完成');
        console.log('request success', result);
        var myProblemList = mapFieldsOfGetMyProblems(result.data.PageData);
        // 保存当前用户的WechatId
        var myProblemListOfWechatId = myProblemList.map(item => {
          var temp = item;
          temp.user = that.data.userInfo.user;
          temp.url = that.data.userInfo.url;
          temp.timer = timeago().format(item.timer, 'zh_CN');
          return temp;
        });
        that.setData({ pollingTops: myProblemListOfWechatId });

        // 保存我的问题列表Storage
        wx.setStorageSync(constants.RCW_MY_PROBLEM_LIST, myProblemListOfWechatId);
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
    // 设置WechatId
    var user = wechat.getUserInfo();
    this.setData({
      wechatId: options.wechatId || user && user.wechatId
    });

    // 获取用户账户信息
    setTimeout(this.getUserInfo, 100);
  }
});