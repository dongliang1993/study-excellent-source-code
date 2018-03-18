// 基本用法
// classNames('foo', 'bar'); // => 'foo bar' 
// classNames('foo', { bar: true }); // => 'foo bar' 
// classNames({ 'foo-bar': true }); // => 'foo-bar' 
// classNames({ 'foo-bar': false }); // => '' 
// classNames({ foo: true }, { bar: true }); // => 'foo bar' 
// classNames({ foo: true, bar: true }); // => 'foo bar' 
 
// // lots of arguments of various types 
// classNames('foo', { bar: true, duck: false }, 'baz', { quux: true }); // => 'foo bar baz quux' 
 
// // other falsy values are just ignored 
// classNames(null, false, 'bar', undefined, 0, 1, { baz: null }, ''); // => 'bar 1' 

// var arr = ['b', { c: true, d: false }];
// classNames('a', arr); // => 'a b c' 


/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg) && arg.length) {
        // inner 是字符串
				var inner = classNames.apply(null, arg);
				if (inner) {
					classes.push(inner);
				}
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());
