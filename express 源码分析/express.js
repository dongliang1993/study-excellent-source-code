/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var bodyParser = require('body-parser')
// EventEmitter 是一个对象，通过prototype可以得到events模块的所有方法，比如on、emit这些。
var EventEmitter = require('events').EventEmitter;
// mixin 可以看作一个工具方法，目的把一个A对象的属性合并到B对象，会保留属性描述符
var mixin = require('merge-descriptors');
var proto = require('./application');
var Route = require('./router/route');
var Router = require('./router');
var req = require('./request');
var res = require('./response');

/**
 * Expose `createApplication()`.
 */
// 其实就是导出了一个构造函数
exports = module.exports = createApplication;

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */
// var express = require('express');
// var app = express();

function createApplication() {
  // 这个实际上 createApplication 函数调用后返回的还是一个函数
  // 在这个函数身上挂载了很多方法和属性
  // 是请求来了之后的触发函数
  var app = function(req, res, next) {
    app.handle(req, res, next);
  };

  //为app添加EventEmitter的原型的各个方法
  mixin(app, EventEmitter.prototype, false);
  //为app添加application模块定义的属性和方法
  mixin(app, proto, false);

  // expose the prototype that will get set on requests
  //创建一个对象，只有app属性，但是原型为request(原型为原始的IncomingMessage添加了几个方法的对象)
  app.request = Object.create(req, {
    app: { configurable: true, enumerable: true, writable: true, value: app }
  })

  // expose the prototype that will get set on responses
  //创建一个对象，只有app属性，但是原型为response(原型为原始的response添加了几个方法的对象)
  app.response = Object.create(res, {
    app: { configurable: true, enumerable: true, writable: true, value: app }
  })
  //初始化，这个方法是来自于application中定义的，主要执行一些默认设置
  app.init();
  return app;
}

/**
 * Expose the prototypes.
 */

exports.application = proto;
exports.request = req;
exports.response = res;

/**
 * Expose constructors.
 */

exports.Route = Route;
exports.Router = Router;

/**
 * Expose middleware
 */

exports.json = bodyParser.json
exports.query = require('./middleware/query');
exports.static = require('serve-static');
exports.urlencoded = bodyParser.urlencoded

/**
 * Replace removed middleware with an appropriate error message.
 */

;[
  'bodyParser',
  'compress',
  'cookieSession',
  'session',
  'logger',
  'cookieParser',
  'favicon',
  'responseTime',
  'errorHandler',
  'timeout',
  'methodOverride',
  'vhost',
  'csrf',
  'directory',
  'limit',
  'multipart',
  'staticCache',
].forEach(function (name) {
  Object.defineProperty(exports, name, {
    get: function () {
      throw new Error('Most middleware (like ' + name + ') is no longer bundled with Express and must be installed separately. Please see https://github.com/senchalabs/connect#middleware.');
    },
    configurable: true
  });
});