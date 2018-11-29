'use strict';

var utils = require('./../utils');

// 这一部分是用来生成拦截器的
// 拦截器其实没有想象的那么高深，本质很简单，就是一个队列，然后请求和相应依次经过这个队列里面的每一个方法

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  // 一开始我还以为是通过 uuid 生成的唯一标识
  // 最后返回的其实是下标，这样的话会简单很多，而且后面注销掉一个对应的拦截器也会方便很多
  // redux 中也是类似的道理，只不多 redux 其实返回的是注册函数本身...
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  // 取消拦截器也很简单，直接通过下标把对应的拦截器设置为 null
  // 没有通过 splice 或者替换数组的方式
  // 我个人觉得，其实没啥区别
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  // 拦截器的遍历也很简单，就是把之前的 handlers 拿出来，然后挨个走，如果不是 null（没有移除）
  // 就把对应的拦截器传进执行回调
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;
