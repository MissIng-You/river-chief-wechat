/**
 * @fileOverview 问题上报 problem-report 页面
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

// 映射“getAreas”的字段
var mapFieldsOfGetAreas = function (result) {
  var fields = {
    'AreaCode': 'code',
    'AreaName': 'name',
    'AreaLevel': 'level'
  };

  var mapResult = utils.mapFields(result, fields);

  return mapResult;
};

// 映射“getReaches”的字段
var mapFieldsOfGetReaches = function (result) {
  var fields = {
    'Id': 'id',
    'ReachName': 'name',
    'RiverBaseInfoId': 'riverId',
    'RiverName': 'riverName'
  };

  var mapResult = utils.mapFields(result, fields);

  return mapResult;
};

// 创建问题模型
var createReportModel = function (result) {
  if (!result) return null;
  var user = wechat.getUserInfo();
  var fileList = result.fileUrls.map(item => {
    return {
      'FileUrl': item,
      'FileType': 0
    };
  });
  if(!user || !user.wechatId) return wechat.fail('请重新登录');
  if(!result.location) return wechat.fail('请选择位置');
  if(!result.selectAreaCode) return wechat.fail('请选择行政区');
  if(!result.selectReachId) return wechat.fail('请选择河段');
  if(!result.selectMainItem || !result.selectSubItem) return wechat.fail('请选择问题类型');
  // if (!result.selectDescribe) return wechat.fail('请输入问题描述');
  if(!result.fileUrls || !result.fileUrls.length) return wechat.fail('请至少上传一张图片');
  var model = {
    'WeChatUserId': user.wechatId,
    'CountyCode': result.selectAreaCode,
    'DetailAddress': result.address,
    'FullAddress': result.address,
    'Lng': result.location && result.location.longitude,
    'Lat': result.location && result.location.latitude,
    'RiverBaseInfoId': result.selectReachId,
    'RiverName': result.selectReachName,
    'QuestionDescribe': `${result.selectMainItem};${result.selectSubItem};${result.selectDescribe}`,
    'FileList': fileList
  };
  return model;
};

// 声明问题上报页面
Page({

  // 数据项
  data: {
    // API
    upreportProblem: config.service.upreportProblem,
    getAreas: config.service.getAreas,
    getReaches: config.service.getReaches,
    uploadUrl: config.service.uploadUrl,

    // 常量信息
    cities: config.constant.cities,
    areaList: config.constant.areas,

    // 获取的位置信息
    location: undefined,
    address: '',
    areaName: '甘孜藏族自治州',

    selectAreaIndex: 0,
    selectAreaCode: undefined,
    selectReachIndex: 0,
    selectReachId: undefined,
    selectReachName: undefined,
    selectMainIndex: undefined,
    selectMainItem: undefined,
    selectSubIndex: [],
    selectSubItem: undefined,
    selectDescribe: '',
    previewUrls: [],
    fileUrls: [],

    // 行政区划
    areas: [{
      code: '-1',
      name: '请选择',
      level: -1
    }],

    // 河段信息
    reaches: [{
      id: '-1',
      name: '请选择'
    }],

    // 问题主项
    mainItems: [
      { key: 'weizhang', value: '违章' },
      { key: 'paiwukou', value: '排污口' },
      { key: 'hezhong', value: '河中' },
      { key: 'shuiti', value: '水体' },
      { key: 'hemian', value: '河面' },
      { key: 'hezhangpai', value: '河长牌' },
      { key: 'hean', value: '河岸' }
    ],

    // 问题子项
    subItems: {
      weizhang: [
        { id: '001', value: '非法占用河道' },
        { id: '002', value: '涉水违章建筑物' }
      ], 
      paiwukou: [
        { id: '001', value: '污水直排' },
        { id: '002', value: '废水颜色或气味异常' },
        { id: '003', value: '新增排污口' },
        { id: '004', value: '标示未设置' }
      ],
      hezhong: [
        { id: '001', value: '围网养殖' },
        { id: '002', value: '泥污淤积' },
        { id: '003', value: '沉船' },
        { id: '004', value: '倾倒废土弃渣' },
        { id: '005', value: '工业固废和危废' }
      ],
      shuiti: [
        { id: '001', value: '气味异常' },
        { id: '002', value: '颜色异常' }
      ],
      hemian: [
        { id: '001', value: '杂物漂浮' },
        { id: '002', value: '油污漂浮' },
        { id: '003', value: '病死动物' }
      ],
      hezhangpai: [
        { id: '001', value: '未设置或缺失' },
        { id: '002', value: '信息更新不及时' },
        { id: '003', value: '设置不规范' }
      ],
      hean: [
        { id: '001', value: '生活垃圾' },
        { id: '002', value: '工业垃圾' },
        { id: '003', value: '建筑垃圾' },
        { id: '004', value: '农业生产废弃物' },
        { id: '005', value: '其他杂物堆放' },
      ],
      
    },
  },

  // 选择行政区划
  selectArea: function (e) {
    var value = e.detail.value;
    this.setData({
      selectAreaIndex: value,
      selectAreaCode: value ? this.data.areas[value].code : undefined
    });

    // 获取河段信息
    setTimeout(this.getReaches, 100);
  },

  // 选择河段信息
  selectReach: function (e) {
    var value = e.detail.value;
    var reach = value ? this.data.reaches[value] : undefined;
    this.setData({
      selectReachIndex: value,
      selectReachId: reach ? reach.id : undefined,
      selectReachName: reach ? reach.name : undefined
    });
  },

  // 选择主项
  selectMainItem: function (e) {
    var value = e.detail.value;
    var mainItem = this.data.mainItems.filter(item => item.key === value);

    // 清除子项内容
    if (this.data.selectMainIndex !== value) {
      this.setData({
        selectSubIndex: [],
        selectSubItem: ''
      });
    }

    this.setData({
      selectMainIndex: value,
      selectMainItem: mainItem && mainItem.length ? mainItem[0].value : undefined
    });
  },

  // 选择子项
  selectSubItem: function (e) {
    var value = e.detail.value;
    this.setData({
      selectSubIndex: value,
      selectSubItem: value.join('|')
    });
  },

  // 选择城市
  _filterCity: function (value) {
    var filterCity = this.data.cities.filter(item => {
      var valueRE = new RegExp('(' + item + ')', 'g');
      return valueRE.test(value) ? item : '';
    });

    return filterCity && filterCity.length ? filterCity[0] : '';
  },

  // 选择区域
  _filterArea: function (value) {
    var filterArea = this.data.areaList.filter(item => {
      var valueRE = new RegExp('(' + item + ')', 'g');
      return valueRE.test(value) ? item : '';
    });

    return filterArea && filterArea.length ? filterArea[0] : '';
  },

  // 选择地图位置
  selectAddress(event) {
    var that = this;
    wx.chooseLocation({
      success: function (result) {
        if (!result || !result.address || !result.name) {
          wechat.fail('请选择正确的位置');
          return;
        }
        that.setData({ 
          location: result,
          address: result.address + result.name,
          // 设置当前行政区名称
          areaName: that._filterCity(result.address)
        });

        // 获取行政区划
        setTimeout(that.getAreas, 100);

        // 获取河段信息
        setTimeout(that.getReaches, 100);
      },
      fail: function (error) {
        wechat.fail('请选择位置');
      }
    });
  },

  // 上传图片
  doUpload() {
    var that = this

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var filePath = res.tempFilePaths[0];
        wechat.loading();
        wx.uploadFile({
          url: that.data.uploadUrl,
          filePath: filePath,
          name: 'file',

          success: function (res) {
            wechat.success('上传图片成功');
            res = JSON.parse(res.data);

            var previewUrls = that.data.previewUrls.slice(0);
            previewUrls.push(res.Data.AbsoluteUrl);

            var tempFileUrls = that.data.fileUrls.slice(0);
            tempFileUrls.push(res.Data.RelativeUrl);

            that.setData({
              previewUrls: previewUrls,
              fileUrls: tempFileUrls
            });
          },

          fail: function (error) {
            wechat.fail('图片上传失败，请重新上传!');
          }
        });
      },
      fail: function (error) {
        wechat.fail('选择图片失败!');
      }
    });
  },

  // 预览图片
  preview(event) {
    wechat.preview(event);
  },

  // 问题上报
  onSubmit(event) {
    // 设置问题描述内容
    this.setData({ selectDescribe: event.detail.value.selectDescribe });
    var reportModel = createReportModel(this.data);
    this.upreportProblem(reportModel);
  },

  // 获取行政区划
  getAreas() {
    var that = this;

    // wechat.loading();

    if(!that.data.areaName) return;

    qcloud.request({
      // 要请求的地址
      url: this.data.getAreas,

      method: 'POST',

      data: utils.createAPIParams(that.data.areaName),

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      // login: true,

      success(result) {
        wechat.success('请求成功完成');
        console.log('request success', result);
        var areas = mapFieldsOfGetAreas(result.data.Data);
        var filterArea = that.data.location && that._filterArea(that.data.location.address);
        // 更新行政区索引及编码
        areas.forEach((item, index) => {
          if(item.name === filterArea) {
            that.setData({
              selectAreaIndex: index,
              selectAreaCode: item.code
            });
            return true;
          }
        });
        that.setData({ areas: areas });
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

  // 获取河段信息
  getReaches() {
    var that = this;

    // wechat.loading();

    if (!that.data.selectAreaCode) return;

    qcloud.request({
      // 要请求的地址
      url: this.data.getReaches,

      method: 'POST',

      data: utils.createAPIParams({
        AreaCode: that.data.selectAreaCode,
      }),

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      // login: true,

      success(result) {
        wechat.success('请求成功完成');
        console.log('request success', result);
        that.setData({ reaches: mapFieldsOfGetReaches(result.data.Data) });
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

  // 大众河长问题上报
  upreportProblem(model) {
    var that = this;

    if (!model || !model['WeChatUserId']) return;

    wechat.loading();

    qcloud.request({
      // 要请求的地址
      url: this.data.upreportProblem,

      method: 'POST',

      data: utils.createAPIParams(model),

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      // login: true,

      success(result) {
        console.log('request success', result);
        if(result && result.IsError) {
          return wechat.fail(result && result.Message || '上传失败!');
        }
        wechat.success('请求成功完成');
        wx.navigateBack({
          delta: 1
        });
        wx.reLaunch({
          url: '../../pages/account/account',
        });
      },

      fail(error) {
        wechat.fail('请求失败', error);
        console.log('request fail', error);
      },

      complete() {
        console.log('request complete');
      }
    });
  }

});