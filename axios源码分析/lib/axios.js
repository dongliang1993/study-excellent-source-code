'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 *
 * 用来创建 Axios 实例，注意，最后返回的是一个方法
 */
function createInstance(defaultConfig) {
  // context 是 Axios 构造函数的实例
  // context = {
  //   defaults: {},
  //   interceptors: {
  //     request,
  //     response
  //   }
  // }
  var context = new Axios(defaultConfig);

  // bind 就是 es6 bind 的 polyfill
  // 第一个参数是要被绑定上下文的函数，第二个参数是需要绑定的上下文
  // 所以 instance 其实是一个函数
  // bind 最后会返回一个新的函数
  var instance = bind(Axios.prototype.request, context);

  // 下面两步就是常规操纵了，把 Axios.prototype 和 context 的属性全部复制到 instance 上
  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
// createInstance 接受一个 object 作为参数, 创建一个实例，这个实例就是我们最后真正导出的东西
// 我们取名叫 axios
// 根据文档来看，axios 这个实例其实是一个【函数】，所以才支持 axios(config)/axios(url[, config]) 这种使用方法
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
// 将 Axios class 挂在到了 axios 实例上
axios.Axios = Axios;

// Factory for creating new instances
// axios.create([config]) 可以新建一个 axios 的实例，原来只是在上面挂了一个【生成自己的】方法...
// 将默认的参数和传进去的参数合并在了一起
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
// 挂载 cancel 相关的事件
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
// 原来 axios.all 直接用的原生的
axios.all = function all(promises) {
  return Promise.all(promises);
};

// axios.all([getUserAccount(), getUserPermissions()])
//   .then(axios.spread(function (acct, perms) {
//     // 两个请求现在都执行完成
//   }));
// 主要是用来处理并发的，暂时还不知道是什么原理
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;
