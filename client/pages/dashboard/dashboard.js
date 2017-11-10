/**
 * @fileOverview 公众巡河 Dashboard 页面
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

// 映射“getRanks”的字段
var mapFieldsOfGetRanks = function (result) {
  var fields = {
    'WeChatUserId': 'id',
    'OpenId': 'openId',
    'Nickname': 'user',
    'Sex': 'gender',
    'HeadUrl': 'url',
    'Rank': 'rank',
    'IsAmb': 'isVip',
    'CurMonthCount': 'pollingCount',
    'LastMonthCount': 'lastPollingCount'
  };

  var mapResult = utils.mapFields(result, fields);

  return mapResult;
};

// 映射“getHotProblems”的字段
var mapFieldsOfGetHotProblems = function (result) {
  var fields = {
    'Id': 'id',
    'WeChatUserId': 'wechatId',
    'OpenId': 'openId',
    'Nickname': 'user',
    'HeadUrl': 'url',
    'FullAddress': 'address',
    'QuestionDescribe': 'describe',
    'RiverName': 'title',
    'State': 'solve',
    'CreateTime': 'timer',
    'FileList': 'attachments',
    'FileUrl': 'url'
  };

  var mapResult = utils.mapFields(result, fields);
  
  console.log('map fields: %o', mapResult);

  return mapResult;
};

// 映射“registerUser”的字段
var mapFieldsOfRegisterUser = function (result) {
  var fields = {
    'Id': 'wechatId',
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

// 创建用户模型
var createUserModel = function (result) {
  if (!result) return null;
  var model = {
    'OpenId': result.openId,
    'NickName': result.nickName,
    'Sex': result.gender,
    'HeadUrl': result.avatarUrl,
    'Country': result.country,
    'Province': result.province,
    'City': result.city
  };
  return model;
};

// 声明面板页面
Page({

  // 面板页数据项
  data: {
    // API
    getRanks: config.service.getRanks,
    getHotProblems: config.service.getHotProblems,
    getProblemDetails: config.service.getProblemDetails,
    registerUser: config.service.registerUser,
    requestUrl: config.service.requestUrl,

    // 当前授权用户Id
    currentWechatId: undefined,
    windowHeight: 0,
    loading: false,

    // 当前页索引
    pageIndex: 1,
    totalPage: 1,

    // Top10 Ranks
    ranks: [],
    // ranks: [{
    //   id: 1,
    //   url: 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg'
    // }, {
    //   id: 2,
    //   url: 'http://www.henan100.com/d/file/news/gn/now/20170518/29360e6d26da7516833b0957690bcebb.jpg'
    // }, {
    //   id: 3,
    //   url: 'http://n.sinaimg.cn/hb/transform/20170717/cBEo-fyiavtv8781967.jpg'
    // }],

    // attachements
    attachements: [{
      id: 1,
      url: 'http://171.221.202.126:30002/Image/Static/20171110/river.jpg',
      title: '青山绿水就是金山银山.'
    }, {
        id: 2,
        url: 'http://171.221.202.126:30002/Image/Static/20171110/people.jpg',
        title: '高新区开展清理江安河垃圾志愿服务.'
    }, {
        id: 3,
        url: 'http://171.221.202.126:30002/Image/Static/20171110/panel.jpg',
        title: '彭山区岷江河长公示牌.'
    }],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    indicatorColor: "#fff",
    indicatorActiveColor: "#46bde2",

    // 巡河Top5
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

  // 获取本月护河大使Top10
  getRanks() {
    var that = this;

    wechat.loading();

    qcloud.request({
      // 要请求的地址
      url: this.data.getRanks,

      method: 'POST',

      data: utils.createAPIParams(10),

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      // login: true,

      success(result) {
        wechat.success('请求成功完成');
        console.log('request success', result);
        that.setData({ranks: mapFieldsOfGetRanks(result.data.Data)});
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

  // 更新热门问题列表
  _updateHotProblem(problems, pageIndex) {
    var orignalProblems = this.data.pollingTops.slice(0);
    if(pageIndex === 1) {
      orignalProblems = problems;
    } else {
      problems.forEach(item => {
        var filter = orignalProblems.filter(p => p.id === item.id);
        if (filter && filter.length) return false;
        orignalProblems.push(item);
      });
    }
    
    this.setData({
      pollingTops: orignalProblems,
      loading: false
    });
    // 保存问题列表Storage
    wx.setStorageSync(constants.RCW_PROBLEM_LIST, orignalProblems);
  },

  // 获取热门问题上报
  getHotProblems() {
    var that = this;

    wechat.loading();

    qcloud.request({
      // 要请求的地址
      url: this.data.getHotProblems,

      method: 'POST',

      data: utils.createAPIParams({
        PageIndex: this.data.pageIndex,
        PageSize: 5
      }),

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      // login: true,

      success(result) {
        wechat.success('请求成功完成');
        console.log('request success', result);
        var problemList = mapFieldsOfGetHotProblems(result.data.PageData);
        //设置总页数
        that.setData({
          totalPage: result.data.TotalPage
        });
        // 格式化时间
        var problemListOfFormat = problemList.map(item => {
          var temp = item;
          temp.timer = timeago().format(item.timer, 'zh_CN');
          return temp;
        });
        // 更新热门问题列表
        that._updateHotProblem(problemListOfFormat, that.data.pageIndex);
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

  // 微信登录授权
  doLogin() {
    var that = this;

    wechat.loading('正在登录...');

    qcloud.login({
      success(result) {
        wechat.success('登录成功');
        console.log('登录成功', result);

        // 若没有OpenId，则再调用一次登录
        if(!result || !result.openId) {
          that.doLogin();
          return;
        }

        // 注册授权用户
        var user = createUserModel(result);

        if(!wx.getStorageSync('RCW_USER_OPENID')) {
          !!user && that.registerUser(user);
        } else {
          // 保存当前授权用户Id
          var userInfo = wechat.getUserInfo();
          that.setData({ currentWechatId: userInfo.wechatId });
        }
      },

      fail(error) {
        wechat.fail('登录失败', error);
        console.log('登录失败', error);
      }
    });
  },

  // 注册授权用户
  registerUser(user) {
    var that = this;

    wechat.loading();

    qcloud.request({
      // 要请求的地址
      url: this.data.registerUser,

      method: 'POST',

      data: utils.createAPIParams(user),

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        wechat.success('请求成功完成');
        console.log('request success', result);

        // 保存登录用户信息
        var userInfo = mapFieldsOfRegisterUser(result.data.Data);
        if(!!userInfo) {
          // 保存当前授权用户Id
          that.setData({currentWechatId: userInfo.id});
          wechat.setUserInfo(userInfo);
          wx.setStorageSync('RCW_USER_OPENID', userInfo.openId);
        }
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

  onLoad() {
    var that = this;

    wechat.getSystem(function(system) {
      console.log(system);
      that.setData({windowHeight: system.windowHeight});
    });
  },

  onReady() {
    // 微信登录授权
    setTimeout(this.doLogin, 100);

    // 获取本月护河大使Top10
    setTimeout(this.getRanks, 100);

    // 获取热门问题上报
    setTimeout(this.getHotProblems, 100);
  },

  // 刷新热门问题
  _refreshHotProblems(isScrollUp) {
    var pageIndex = this.data.pageIndex;
    var totalPage = this.data.totalPage;
    var loading = this.data.loading;

    if (!!loading || totalPage <= pageIndex + 1) return;
    this.setData({
      pageIndex: isScrollUp ? 1 : ++pageIndex,
      loading: true
    });
    this.getHotProblems();
  },

  // 上拉获取最新 热门问题上报
  getNewHotProblems(event) {
    var that = this;

    utils.throttle(that._refreshHotProblems, 5000)(true);
  },

  // 下拉刷新 热门问题上报
  refreshHotProblems(event) {
    var that = this;

    utils.throttle(that._refreshHotProblems, 2000)(false);
  },
})