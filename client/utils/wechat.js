
// 引入自定义封装的Constants类
var constants = require('./constants');

// wechat.loading 正在加载
var loading = function(title) {
  wx.showToast({
    title: title || '请稍后...',
    icon: 'loading',
    duration: 10000
  });
};

// wechat.success 加载成功
var success = function (title) {
  wx.hideToast();
  // wx.showToast({
  //   title: title || '请求完成.',
  //   icon: 'success'
  // });
};

// wechat.fail 加载失败
var fail = function (title, content) {
  wx.hideToast();

  wx.showModal({
    title: title || '失败提示.',
    content: !!content ? JSON.stringify(content, null, 2) : '',
    showCancel: false
  });
};

// wechat.getUserInfo 获取用户信息
var getUserInfo = function() {
  return wx.getStorageSync(constants.RCW_USER_INFO);
};

// wechat.setUserInfo 设置用户信息
var setUserInfo = function(val) {
  wx.setStorageSync(constants.RCW_USER_INFO, val)
};

// wechat.prelogin 微信登录前的准备
var prelogin = function(callback) {
  wx.getSetting({
    success(result) {
      if(!result.authSetting['scope.userInfo']) {
        wx.authorize({
          scope: 'scope.userInfo',
          success() {
            callback && callback();
          },
          fail() {
            fail('授权"scope.userInfo"失败');
          }
        });
      } else {
        callback && callback();
      }
    },
    fail(error) {
      fail('获取"getSetting"失败');
    }
  });
};

// wechat.getClientHeight 获取屏幕高度
var getSystem = function (callback) {
  wx.getSystemInfo({
    success: function(result) {
      callback && callback(result);
    },
    fail: function(error) {
      fail('获取getSystemInfo失败');
    }
  });
};

/* wechat.preview 预览图片/视频 */

// 判断图片
var isImage = function (value) {
  var imageRE = new RegExp('^(\.\.\/|https?).+\.(gif|jpg|jpeg|png|bmp)$', 'i');
  return value && imageRE.test(value);
};

// 判断视频
var isVideo = function (value) {
  var videoRE = new RegExp('^https?.+\.(mp4|swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb)$', 'i');
  return value && videoRE.test(value);
};

// 预览图片/视频
var preview = function (event) {
  var dataset = event.currentTarget.dataset;
  var url = dataset.url;
  var urls = dataset.urls;
  var id = event.currentTarget.id || event.target.id;

  // 预览视频
  if(id && isVideo(url)) {
    var videoContext = wx.createVideoContext(id);
    videoContext.requestFullScreen();
    videoContext.play();
    return;
  }

  var previewUrls = [];
  urls && urls.forEach(item => {
    var temp = undefined;
    if(typeof item === 'string' && isImage(item)) {
      temp = item;
    } else if (typeof item === 'object' && isImage(item.url)) {
      temp = item.url;
    }
    temp && previewUrls.push(temp);
  });

  if (!url || !previewUrls || !previewUrls.length) {
    return fail(`${url || ''}图片预览失败.`);
  }
  
  wx.previewImage({
    current: url,
    urls: previewUrls
  });
};

module.exports = {
  loading: loading,
  success: success,
  fail: fail,
  setUserInfo: setUserInfo,
  getUserInfo: getUserInfo,
  prelogin: prelogin,
  getSystem: getSystem,
  preview: preview
}