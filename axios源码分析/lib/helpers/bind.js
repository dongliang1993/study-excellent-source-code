'use strict';

// bind 是一个高阶函数
// 里面还会返回一个 wrap
// 如果给 bind 函数在绑定 this ，会失效

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};
