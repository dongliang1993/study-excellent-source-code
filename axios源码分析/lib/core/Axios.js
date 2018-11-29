'use strict';

var utils = require('./../utils');
var buildURL = require('../helpers/buildURL');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var mergeConfig = require('./mergeConfig');

/**
 * Create a new instance of Axios *
 * @param {Object} instanceConfig The default config for the instance
 *
 * Axios 是最核心的部分
 * Axios 本身是一个类，然后返回一个实例
 */
function Axios(instanceConfig) {
  // 把你传进来的 config 挂在实例上
  this.defaults = instanceConfig;
  this.interceptors = {
    // InterceptorManager 就是用来做拦截器的，分为请求拦截和相应拦截
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 * 用法:
 * 1. axios(config)
 * 2. axios(url[, config])
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API

  // 无论怎么样使用，其实内部最后都会变成一个 config，然后通过这个来调用
  // axios({
  //   method: 'post',
  //   url: '/user/12345',
  //   data: {
  //     firstName: 'Fred',
  //     lastName: 'Flintstone'
  //   }
  // });

  if (typeof config === 'string') { // 处理 axios(url[, config])
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);
  // 默认是 get 请求,并且全部小写
  config.method = config.method ? config.method.toLowerCase() : 'get';

  // Hook up interceptors middleware
  // 真正用来发送请求的东西 dispatchRequest
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  // 最后变成 [...fulfilled1, fulfilled0, dispatchRequest, undefined, rejected0, rejected1...]
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// 别名的方法都是在这里统一配置的
// 需要注意的是，有的方法是有请求体的('post', 'put', 'patch')，所以需要单独拿出来处理

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;
