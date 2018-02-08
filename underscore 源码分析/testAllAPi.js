// 这个主要是用来删除的，看完一点删除一点
(function() {

  // An internal function for creating a new object that inherits from another.
  // use in `_.create`
  var baseCreate = function(prototype) {
    // 如果 prototype 参数不是对象
    if (!_.isObject(prototype)) return {};

    // 如果浏览器支持 ES5 Object.create
    if (nativeCreate) return nativeCreate(prototype);

    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };


  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094

  // Math.pow(2, 53) - 1 是 JavaScript 中能精确表示的最大数字
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;


  // Collection Functions
  // 数组或者对象的扩展方法
  // 共 25 个扩展方法
  // --------------------


  // Create a reducing function iterating left or right.
  // dir === 1 -> _.reduce
  // dir === -1 -> _.reduceRight
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
     // console.log(memo)
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        // 迭代，返回值供下次迭代调用
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      // 每次迭代返回值，供下次迭代调用
      return memo;
    }
    // _.reduce（_.reduceRight）可传入的 4 个参数
    // obj 数组或者对象
    // iteratee 迭代方法，对数组或者对象每个元素执行该方法
    // memo 初始值，如果没有，则从 obj 第一个元素开始迭代
    // 如果没有，则从 obj 第二个元素开始迭代，将第一个元素作为初始值
    // context 为迭代函数中的 this 指向
    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      // 如果没有指定初始值
      // 则把第一个元素指定为初始值
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        // 根据 dir 确定是向左还是向右遍历
        index += dir;
      }

      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  // 与 ES5 中 Array.prototype.reduce 使用方法类似
  // _.reduce(list, iteratee, [memo], [context])
  // _.reduce 方法最多可传入 4 个参数
  // memo 为初始值，可选
  // context 为指定 iteratee 中 this 指向，可选
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  // 与 ES5 中 Array.prototype.reduceRight 使用方法类似
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  // 寻找数组或者对象中第一个满足条件（predicate 函数返回 true）的元素
  // 并返回该元素值
  // _.find(list, predicate, [context])
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    // 如果 obj 是数组，key 为满足条件的下标
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      // 如果 obj 是对象，key 为满足条件的元素的 key 值
      key = _.findKey(obj, predicate, context);
    }

    // 如果该元素存在，则返回该元素
    // 如果不存在，则默认返回 undefined（函数没有返回，即返回 undefined）
    if (key !== void 0 && key !== -1) return obj[key];
  };



  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  // 与 ES5 中的 Array.prototype.every 方法类似
  // 判断数组中的每个元素或者对象中每个 value 值是否都满足 predicate 函数中的判断条件
  // 如果是，则返回 ture；否则返回 false（有一个不满足就返回 false）
  // _.every(list, [predicate], [context])
  _.every = _.all = function(obj, predicate, context) {
    // 根据 this 指向，返回相应 predicate 函数
    predicate = cb(predicate, context);

    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;

    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      // 如果有一个不能满足 predicate 中的条件
      // 则返回 false
      if (!predicate(obj[currentKey], currentKey, obj))
        return false;
    }

    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  // 与 ES5 中 Array.prototype.some 方法类似
  // 判断数组或者对象中是否有一个元素（value 值 for object）满足 predicate 函数中的条件
  // 如果是则返回 true；否则返回 false
  // _.some(list, [predicate], [context])
  _.some = _.any = function(obj, predicate, context) {
    // 根据 context 返回 predicate 函数
    predicate = cb(predicate, context);
    // 如果传参是对象，则返回该对象的 keys 数组
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      // 如果有一个元素满足条件，则返回 true
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };


  // Invoke a method (with arguments) on every item in a collection.
  // Calls the method named by methodName on each value in the list.
  // Any extra arguments passed to invoke will be forwarded on to the method invocation.
  // 数组或者对象中的每个元素都调用 method 方法
  // 返回调用后的结果（数组或者关联数组）
  // method 参数后的参数会被当做参数传入 method 方法中
  // _.invoke(list, methodName, *arguments)
  _.invoke = function(obj, method) {
    // *arguments 参数
    // slice  =  Array.prototype.slice()
    var args = slice.call(arguments, 2);
    // 判断 method 是不是函数
    var isFunc = _.isFunction(method);
    // 用 map 方法对数组或者对象每个元素调用方法
    // 返回数组
    return _.map(obj, function(value) {
      // 如果 method 不是函数，则可能是 obj 的 key 值
      // 
      // var example= [6,7,5];
      // example.sort();
      // 而 obj[method] 可能为函数
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  // 一个数组，元素都是对象
  // 根据指定的 key 值
  // 返回一个数组，元素都是指定 key 值的 value 值
  /*
  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };
  */
  // _.pluck(list, propertyName)
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  // 根据指定的键值对
  // 选择对象
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  // 寻找第一个有指定 key-value 键值对的对象
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the minimum element (or element-based computation).
  // 寻找最小的元素
  // 类似 _.max
  // _.min(list, [iteratee], [context])
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  // 将数组乱序
  // 如果是对象，则返回一个数组，数组由对象 value 值构成
  // Fisher-Yates shuffle 算法
  // 最优的洗牌算法，复杂度 O(n)
  // 乱序不要用 sort + Math.random()，复杂度 O(nlogn)
  // 而且，并不是真正的乱序
  // @see https://github.com/hanzichi/underscore-analysis/issues/15
  // 
  _.shuffle = function(obj) {
    // 如果是对象，则对 value 值进行乱序
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;

    // 乱序后返回的数组副本（参数是对象则返回乱序后的 value 数组）
    var shuffled = Array(length);

    // 枚举元素
    for (var index = 0, rand; index < length; index++) {
      // 将当前所枚举位置的元素和 `index=rand` 位置的元素交换
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }

    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  // 随机返回数组或者对象中的一个元素
  // 如果指定了参数 `n`，则随机返回 n 个元素组成的数组
  // 如果参数是对象，则数组由 values 组成
  // 
  _.sample = function(obj, n, guard) {
    // 随机返回一个元素
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }

    // 随机返回 n 个
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  // 排序
  // _.sortBy(list, iteratee, [context])
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);

    // 根据指定的 key 返回 values 数组
    // _.pluck([{}, {}, {}], 'value')
    return _.pluck(
      // _.map(obj, function(){}).sort()
      // _.map 后的结果 [{}, {}..]
      // sort 后的结果 [{}, {}..]
      // list 是原数组
      _.map(obj, function(value, index, list) {

        return {
          value: value,
          index: index,
          // 元素经过迭代函数迭代后的值
          criteria: iteratee(value, index, list)
        };
      }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');

  };

  // An internal function used for aggregate "group by" operations.
  // behavior 是一个函数参数
  // _.groupBy, _.indexBy 以及 _.countBy 其实都是对数组元素进行分类
  // 分类规则就是 behavior 函数
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      // 返回结果是一个对象
      var result = {};
      iteratee = cb(iteratee, context);
      // 遍历元素
      _.each(obj, function(value, index) {
        // 经过迭代，获取结果值，存为 key
        var key = iteratee(value, index, obj);
        // 按照不同的规则进行分组操作
        // 将变量 result 当做参数传入，能在 behavior 中改变该值
        behavior(result, value, key);
      });
      // 返回结果对象
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  // groupBy_  _.groupBy(list, iteratee, [context])
  // 根据特定规则对数组或者对象中的元素进行分组
  // result 是返回对象
  // value 是数组元素
  // key 是迭代后的值
  _.groupBy = group(function(result, value, key) {
    // 根据 key 值分组
    // key 是元素经过迭代函数后的值
    // 或者元素自身的属性值

    // result 对象已经有该 key 值了
    if (_.has(result, key))
      result[key].push(value);
    else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    // key 值必须是独一无二的
    // 不然后面的会覆盖前面的
    // 其他和 _.groupBy 类似
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    // 不同 key 值元素数量
    if (_.has(result, key))
      result[key]++;
    else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  // 伪数组 -> 数组
  // 对象 -> 提取 value 值组成数组
  // 返回数组
  _.toArray = function(obj) {
    if (!obj) return [];

    // 如果是数组，则返回副本数组
    // 是否用 obj.concat() 更方便？
    // 
    if (_.isArray(obj)){
      return slice.call(obj);
    } 

    // 如果是类数组，则重新构造新的数组
    // 是否也可以直接用 slice 方法？
    if (isArrayLike(obj)){
      return _.map(obj, _.identity);
    } 

    // 如果是对象，则返回 values 集合
    return _.values(obj);
  };

  // Return the number of elements in an object.
  // 如果是数组（类数组），返回长度（length 属性）
  // 如果是对象，返回键值对数量
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  // 将数组或者对象中符合条件（predicate）的元素
  // 和不符合条件的元素（数组为元素，对象为 value 值）
  // 分别放入两个数组中
  // 返回一个数组，数组元素为以上两个数组（[[pass array], [fail array]]）
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };


  // Array Functions
  // 数组的扩展方法
  // 共 20 个扩展方法
  // Note: All array functions will also work on the arguments object.
  // However, Underscore functions are not designed to work on "sparse" arrays.
  // ---------------

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  // The opposite of zip. Given an array of arrays,
  // returns a series of new arrays,
  // the first of which contains all of the first elements in the input arrays,
  // the second of which contains all of the second elements, and so on.
  // ===== //
  // _.unzip([["moe", 30, true], ["larry", 40, false], ["curly", 50, false]]);
  // => [['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false]]
  // ===== //
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };


  // Generator function to create the findIndex and findLastIndex functions
  // (dir === 1) => 从前往后找
  // (dir === -1) => 从后往前找
  function createPredicateIndexFinder(dir) {
    // 经典闭包
    return function(array, predicate, context) {
      predicate = cb(predicate, context);  
      var length = getLength(array);

      // 根据 dir 变量来确定数组遍历的起始位置
      var index = dir > 0 ? 0 : length - 1;

      for (; index >= 0 && index < length; index += dir) {
        // 找到第一个符合条件的元素
        // 并返回下标值
        if (predicate(array[index], index, array))

          return index;
      }

      return -1;
    };
  }


  // Returns the first index on an array-like that passes a predicate test
  // 从前往后找到数组中 `第一个满足条件` 的元素，并返回下标值
  // 没找到返回 -1
  // _.findIndex(array, predicate, [context])
  _.findIndex = createPredicateIndexFinder(1);

  // 从后往前找到数组中 `第一个满足条件` 的元素，并返回下标值
  // 没找到返回 -1
  // _.findLastIndex(array, predicate, [context])
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  // The iteratee may also be the string name of the property to sort by (eg. length).
  // ===== //
  // _.sortedIndex([10, 20, 30, 40, 50], 35);
  // => 3
  // ===== //
  // var stooges = [{name: 'moe', age: 40}, {name: 'curly', age: 60}];
  // _.sortedIndex(stooges, {name: 'larry', age: 50}, 'age');
  // => 1
  // ===== //
  // 二分查找
  // 将一个元素插入已排序的数组
  // 返回该插入的位置下标
  // _.sortedIndex(list, value, [iteratee], [context])
  _.sortedIndex = function(array, obj, iteratee, context) {
    // 注意 cb 方法
    // iteratee 为空 || 为 String 类型（key 值）时会返回不同方法
    iteratee = cb(iteratee, context, 1);
    // 经过迭代函数计算的值
    // 可打印 iteratee 出来看看
    var value = iteratee(obj);
    var low = 0, high = getLength(array);

    // 二分查找
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value)
        low = mid + 1;
      else
        high = mid;
    }

    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  // _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  // _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    // API 调用形式
    // _.indexOf(array, value, [isSorted])
    // _.indexOf(array, value, [fromIndex])
    // _.lastIndexOf(array, value, [fromIndex])
    return function(array, item, idx) {
      var i = 0, length = getLength(array);

      // 如果 idx 为 Number 类型
      // 则规定查找位置的起始点
      // 那么第三个参数不是 [isSorted]
      // 所以不能用二分查找优化了
      // 只能遍历查找
      if (typeof idx == 'number') {
        if (dir > 0) { // 正向查找
          // 重置查找的起始位置
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else { // 反向查找
          // 如果是反向查找，重置 length 属性值
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        // 能用二分查找加速的条件
        // 有序 & idx !== 0 && length !== 0

        // 用 _.sortIndex 找到有序数组中 item 正好插入的位置
        idx = sortedIndex(array, item);

        // 如果正好插入的位置的值和 item 刚好相等
        // 说明该位置就是 item 第一次出现的位置
        // 返回下标
        // 否则即是没找到，返回 -1
        return array[idx] === item ? idx : -1;
      }

      // 特判，如果要查找的元素是 NaN 类型
      // 如果 item !== item
      // 那么 item => NaN
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }

      // O(n) 遍历数组
      // 寻找和 item 相同的元素
      // 特判排除了 item 为 NaN 的情况
      // 可以放心地用 `===` 来判断是否相等了
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }

      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  // _.indexOf(array, value, [isSorted])
  // 找到数组 array 中 value 第一次出现的位置
  // 并返回其下标值
  // 如果数组有序，则第三个参数可以传入 true
  // 这样算法效率会更高（二分查找）
  // [isSorted] 参数表示数组是否有序
  // 同时第三个参数也可以表示 [fromIndex] （见下面的 _.lastIndexOf）
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);

  // 和 _indexOf 相似
  // 反序查找
  // _.lastIndexOf(array, value, [fromIndex])
  // [fromIndex] 参数表示从倒数第几个开始往前找
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);



  // Function (ahem) Functions
  // 函数的扩展方法
  // 共 14 个扩展方法
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    // 非 new 调用 _.bind 返回的方法（即 bound）
    // callingContext 不是 boundFunc 的一个实例
    if (!(callingContext instanceof boundFunc))
      return sourceFunc.apply(context, args);

    // 如果是用 new 调用 _.bind 返回的方法

    // self 为 sourceFunc 的实例，继承了它的原型链
    // self 理论上是一个空对象（还没赋值），但是有原型链
    var self = baseCreate(sourceFunc.prototype);

    // 用 new 生成一个构造函数的实例
    // 正常情况下是没有返回值的，即 result 值为 undefined
    // 如果构造函数有返回值
    // 如果返回值是对象（非 null），则 new 的结果返回这个对象
    // 否则返回实例
    // @see http://www.cnblogs.com/zichi/p/4392944.html
    var result = sourceFunc.apply(self, args);

    // 如果构造函数返回了对象
    // 则 new 的结果是这个对象
    // 返回这个对象
    if (_.isObject(result)) return result;

    // 否则返回 self
    // var result = sourceFunc.apply(self, args);
    // self 对象当做参数传入
    // 会直接改变值
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  // ES5 bind 方法的扩展（polyfill）
  // 将 func 中的 this 指向 context（对象）
  // _.bind(function, object, *arguments)
  // 可选的 arguments 参数会被当作 func 的参数传入
  // func 在调用时，会优先用 arguments 参数，然后使用 _.bind 返回方法所传入的参数
  _.bind = function(func, context) {
    // 如果浏览器支持 ES5 bind 方法，并且 func 上的 bind 方法没有被重写
    // 则优先使用原生的 bind 方法
    // if (nativeBind && func.bind === nativeBind)
    //   return nativeBind.apply(func, slice.call(arguments, 1));
    // 如果传入的参数 func 不是方法，则抛出错误
    if (!_.isFunction(func))
      throw new TypeError('Bind must be called on a function');

    // polyfill
    // 经典闭包，函数返回函数
    // args 获取优先使用的参数
    var args = slice.call(arguments, 2);
    var bound = function() {
      // args.concat(slice.call(arguments))
      // 最终函数的实际调用参数由两部分组成
      // 一部分是传入 _.bind 的参数（会被优先调用）
      // 另一部分是传入 bound（_.bind 所返回方法）的参数
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };

    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  // _.partial(function, *arguments)
  // _.partial 能返回一个方法
  // pre-fill 该方法的一些参数
  _.partial = function(func) {
    // 提取希望 pre-fill 的参数
    // 如果传入的是 _，则这个位置的参数暂时空着，等待手动填入
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        // 如果该位置的参数为 _，则用 bound 方法的参数填充这个位置
        // args 为调用 _.partial 方法的 pre-fill 的参数 & bound 方法的 arguments
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      // bound 方法还有剩余的 arguments，添上去
      while (position < arguments.length)
        args.push(arguments[position++]);

      return executeBound(func, bound, this, this, args);
    };

    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  // 指定一系列方法（methodNames）中的 this 指向（object）
  // _.bindAll(object, *methodNames)
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    // 如果只传入了一个参数（obj），没有传入 methodNames，则报错
    if (length <= 1)
      throw new Error('bindAll must be passed function names');

    // 遍历 methodNames
    for (i = 1; i < length; i++) {
      key = arguments[i];
      // 逐个绑定
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  //「记忆化」，存储中间运算结果，提高效率
  // 参数 hasher 是个 function，用来计算 key
  // 如果传入了 hasher，则用 hasher 来计算 key
  // 否则用 key 参数直接当 key（即 memoize 方法传入的第一个参数）
  // _.memoize(function, [hashFunction])
  // 适用于需要大量重复求值的场景
  // 比如递归求解菲波那切数
  // @http://www.jameskrob.com/memoize.html
  // create hash for storing "expensive" function outputs
  // run expensive function
  // check whether function has already been run with given arguments via hash lookup
  // if false - run function, and store output in hash
  // if true, return output stored in hash
  // 
  // ??????
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      // 储存变量，方便使用
      var cache = memoize.cache;

      // 求 process._kill();ey
      // 如果传入了 hasher，则用 hasher 函数来计算 key
      // 否则用 参数 key（即 memoize 方法传入的第一个参数）当 key
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      // 如果这个 key 还没被 hash 过（还没求过值）
      if (!_.has(cache, address))
        cache[address] = func.apply(this, arguments);

      // 返回
      return cache[address];
    };

    // cache 对象被当做 key-value 键值对缓存中间运算结果
    memoize.cache = {};
    // console.log(memoize.cache);
    // 返回一个函数（经典闭包）
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  // 延迟触发某方法
  // _.delay(function, wait, *arguments)
  //  如果传入了 arguments 参数，则会被当作 func 的参数在触发时调用
  // 其实是封装了「延迟触发某方法」，使其复用
  _.delay = function(func, wait) {
    // 获取 *arguments
    // 是 func 函数所需要的参数
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      // 将参数赋予 func 函数
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  // 和 setTimeout(func, 0) 相似（源码看来似乎应该是 setTimeout(func, 1)）
  // _.defer(function, *arguments)
  // 如果传入 *arguments，会被当做参数，和 _.delay 调用方式类似（少了第二个参数）
  // 其实核心还是调用了 _.delay 方法，但第二个参数（wait 参数）设置了默认值为 1
  // 如何使得方法能设置默认值？用 _.partial 方法
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  // 函数节流（如果有连续事件响应，则每间隔一定时间段触发）
  // 每间隔 wait(Number) milliseconds 触发一次 func 方法
  // 如果 options 参数传入 {leading: false}
  // 那么不会马上触发（等待 wait milliseconds 后第一次触发 func）
  // 如果 options 参数传入 {trailing: false}
  // 那么最后一次回调不会被触发
  // **Notice: options 不能同时设置 leading 和 trailing 为 false**
  // 示例：
  // var throttled = _.throttle(updatePosition, 100);
  // $(window).scroll(throttled);
  // 调用方式（注意看 A 和 B console.log 打印的位置）：
  // _.throttle(function, wait, [options])
  // sample 1: _.throttle(function(){}, 1000)
  // print: A, B, B, B ...
  // sample 2: _.throttle(function(){}, 1000, {leading: false})
  // print: B, B, B, B ...
  // sample 3: _.throttle(function(){}, 1000, {trailing: false})
  // print: A, A, A, A ...
  // ----------------------------------------- //
  _.throttle = function(func, wait, options) {
    var context, args, result;
    // setTimeout 的 handler
    var timeout = null;
    // 标记时间戳
    // 上一次执行回调的时间戳
    var previous = 0;
    // 如果没有传入 options 参数
    // 则将 options 参数置为空对象
    if (!options)
      options = {};

    var later = function() {
      // 如果 options.leading === false
      // 则每次触发回调后将 previous 置为 0
      // 否则置为当前时间戳
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);

      // 这里的 timeout 变量一定是 null 了吧
      //检测是为了 防止递归调用，产生新的timeout
      if (!timeout)
        context = args = null;
    };

    // 以滚轮事件为例（scroll）
    // 每次触发滚轮事件即执行这个返回的方法
    // _.throttle 方法返回的函数
    return function() {

      // 记录当前时间戳
      var now = _.now();
      // console.log(now);
      // console.log("=====");
      // console.log(previous);
      // console.log("+++");
      // 第一次执行回调（此时 previous 为 0，之后 previous 值为上一次时间戳）
      // 并且如果程序设定第一个回调不是立即执行的（options.leading === false）
      // 则将 previous 值（表示上次执行的时间戳）设为 now 的时间戳（第一次触发时）
      // 表示刚执行过，这次就不用执行了
      if (!previous && options.leading === false)
        previous = now;
      // 距离下次触发 func 还需要等待的时间
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      // 要么是到了间隔时间了，随即触发方法（remaining <= 0）
      // 要么是没有传入 {leading: false}，且第一次触发回调，即立即触发
      // 此时 previous 为 0，wait - (now - previous) 也满足 <= 0
      // 之后便会把 previous 值迅速置为 now
      // ========= //
      // remaining > wait，表示客户端系统时间被调整过
      // 则马上执行 func 函数
      // @see https://blog.coding.net/blog/the-difference-between-throttle-and-debounce-in-underscorejs
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          // 解除引用，防止内存泄露
          timeout = null;
        }
        // 重置前一次触发的时间戳
        previous = now;
        // 触发方法
        // result 为该方法返回值
        result = func.apply(context, args);
        // 引用置为空，防止内存泄露
        // 感觉这里的 timeout 肯定是 null 啊？这个 if 判断没必要吧？
        if (!timeout)
          context = args = null;
      } else if (!timeout && options.trailing !== false) { // 最后一次需要触发的情况
        // 如果已经存在一个定时器，则不会进入该 if 分支
        // 如果 {trailing: false}，即最后一次不需要触发了，也不会进入这个分支
        // 间隔 remaining milliseconds 后触发 later 方法
        timeout = setTimeout(later, remaining);
      }
      // 回调返回值
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  // 函数去抖（连续事件触发结束后只触发一次）
  // sample 1: _.debounce(function(){}, 1000)
  // 连续事件结束后的 1000ms 后触发
  // sample 1: _.debounce(function(){}, 1000, true)
  // 连续事件触发后立即触发（此时会忽略第二个参数）
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      // 定时器设置的回调 later 方法的触发时间，和连续事件触发的最后一次时间戳的间隔
      // 如果间隔为 wait（或者刚好大于 wait），则触发事件
      var last = _.now() - timestamp;

      // 时间间隔 last 在 [0, wait) 中
      // 还没到触发的点，则继续设置定时器
      // last 值应该不会小于 0 吧？
      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        // 到了可以触发的时间点
        timeout = null;
        // 可以触发了
        // 并且不是设置为立即触发的
        // 因为如果是立即触发（callNow），也会进入这个回调中
        // 主要是为了将 timeout 值置为空，使之不影响下次连续事件的触发
        // 如果不是立即执行，随即执行 func 方法
        if (!immediate) {
          // 执行 func 函数
          result = func.apply(context, args);
          // 这里的 timeout 一定是 null 了吧
          // 感觉这个判断多余了
          if (!timeout)
            context = args = null;
        }
      }
    };

    // 嗯，闭包返回的函数，是可以传入参数的
    // 也是 DOM 事件所触发的回调函数
    return function() {
      // 可以指定 this 指向
      context = this;
      args = arguments;

      // 每次触发函数，更新时间戳
      // later 方法中取 last 值时用到该变量
      // 判断距离上次触发事件是否已经过了 wait seconds 了
      // 即我们需要距离最后一次事件触发 wait seconds 后触发这个回调方法
      timestamp = _.now();

      // 立即触发需要满足两个条件
      // immediate 参数为 true，并且 timeout 还没设置
      // immediate 参数为 true 是显而易见的
      // 如果去掉 !timeout 的条件，就会一直触发，而不是触发一次
      // 因为第一次触发后已经设置了 timeout，所以根据 timeout 是否为空可以判断是否是首次触发
      var callNow = immediate && !timeout;

      // 设置 wait seconds 后触发 later 方法
      // 无论是否 callNow（如果是 callNow，也进入 later 方法，去 later 方法中判断是否执行相应回调函数）
      // 在某一段的连续触发中，只会在第一次触发时进入这个 if 分支中
      if (!timeout)
        // 设置了 timeout，所以以后不会进入这个 if 分支了
        timeout = setTimeout(later, wait);

      // 如果是立即触发
      if (callNow) {
        // func 可能是有返回值的
        result = func.apply(context, args);
        // 解除引用
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  // 返回一个 predicate 方法的对立方法
  // 即该方法可以对原来的 predicate 迭代结果值取补集
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  // _.compose(*functions)
  // var tmp = _.compose(f, g, h)
  // tmp(args) => f(g(h(args)))
  _.compose = function() {
    var args = arguments; // funcs
    var start = args.length - 1; // 倒序调用
    return function() {
      var i = start;

      var result = args[start].apply(this, arguments);
      // 一个一个方法地执行
      while (i--)
        result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  // 第 times 触发执行 func（事实上之后的每次触发还是会执行 func）
  // 有什么用呢？
  // 如果有 N 个异步事件，所有异步执行完后执行该回调，即 func 方法（联想 eventproxy）
  // _.after 会返回一个函数
  // 当这个函数第 times 被执行的时候
  // 触发 func 方法
  _.after = function(times, func) {
    return function() {
      // 函数被触发了 times 了，则执行 func 函数
      // 事实上 times 次后如果函数继续被执行，也会触发 func
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  // 函数至多被调用 times - 1 次（(but not including) the Nth call）
  // func 函数会触发 time - 1 次（Creates a version of the function that can be called no more than count times）
  // func 函数有个返回值，前 time - 1 次触发的返回值都是将参数代入重新计算的
  // 第 times 开始的返回值为第 times - 1 次时的返回值（不重新计算）
  // The result of the last function call is memoized and returned when count has been reached.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        // 缓存函数执行结果
        memo = func.apply(this, arguments);
      }

      // func 引用置为空，其实不置为空也用不到 func 了
      if (times <= 1)
        func = null;

      // 前 times - 1 次触发，memo 都是分别计算返回
      // 第 times 次开始，memo 值同 times - 1 次时的 memo
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  // 函数至多只能被调用一次
  // 适用于这样的场景，某些函数只能被初始化一次，不得不设置一个变量 flag
  // 初始化后设置 flag 为 true，之后不断 check flag
  // ====== //
  // 其实是调用了 _.before 方法，并且将 times 参数设置为了默认值 2（也就是 func 至多能被调用 2 - 1 = 1 次）
  _.once = _.partial(_.before, 2);


  // Object Functions
  // 对象的扩展方法
  // 共 38 个扩展方法
  // ----------------



  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  // 跟 _.map 方法很像
  // 但是是专门为对象服务的 map 方法
  // 迭代函数改变对象的 values 值
  // 返回对象副本
  _.mapObject = function(obj, iteratee, context) {
    // 迭代函数
    // 对每个键值对进行迭代
    iteratee = cb(iteratee, context);

    var keys =  _.keys(obj),
        length = keys.length,
        results = {}, // 对象副本，该方法返回的对象
        currentKey;

    for (var index = 0; index < length; index++) {
      currentKey = keys[index];
      // key 值不变
      // 对每个 value 值用迭代函数迭代
      // 返回经过函数运算后的值
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };



  // Returns the first key on an object that passes a predicate test
  // 跟数组方法的 _.findIndex 类似
  // 找到对象的键值对中第一个满足条件的键值对
  // 并返回该键值对 key 值
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    // 遍历键值对
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      // 符合条件，直接返回 key 值
      if (predicate(obj[key], key, obj)) return key;
    }
  };




  // Utility Functions
  // 工具类方法
  // 共 14 个扩展方法
  // -----------------


  // Run a function **n** times.
  // 执行某函数 n 次
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++)
      accum[i] = iteratee(i);
    return accum;
  };

  // List of HTML entities for escaping.
  // HTML 实体编码
  // escapeMap 用于编码
  // see @http://www.cnblogs.com/zichi/p/5135636.html
  // in PHP, htmlspecialchars — Convert special characters to HTML entities
  // see @http://php.net/manual/zh/function.htmlspecialchars.php
  // 能将 & " ' < > 转为实体编码（下面的前 5 种）
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    // 以上四个为最常用的字符实体
    // 也是仅有的可以在所有环境下使用的实体字符（其他应该用「实体数字」，如下）
    // 浏览器也许并不支持所有实体名称（对实体数字的支持却很好）
    "'": '&#x27;',
    '`': '&#x60;'
  };

  // _.invert 方法将一个对象的键值对对调
  // unescapeMap 用于解码
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    // 正则替换
    // 注意下 ?:
    var source = '(?:' + _.keys(map).join('|') + ')';

    // 正则 pattern
    var testRegexp = RegExp(source);

    // 全局替换
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };

  // Escapes a string for insertion into HTML, replacing &, <, >, ", `, and ' characters.
  // 编码，防止被 XSS 攻击等一些安全隐患
  _.escape = createEscaper(escapeMap);

  // The opposite of escape
  // replaces &amp;, &lt;, &gt;, &quot;, &#96; and &#x27; with their unescaped counterparts
  // 解码
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  // ERB => Embedded Ruby
  // Underscore 默认采用 ERB-style 风格模板，也可以根据自己习惯自定义模板
  // 1. <%  %> - to execute some code
  // 2. <%= %> - to print some value in template
  // 3. <%- %> - to print some values HTML escaped
  _.templateSettings = {
    // 三种渲染模板
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',  // 回车符
    '\n':     'n',  // 换行符
    // http://stackoverflow.com/questions/16686687/json-stringify-and-u2028-u2029-check
    '\u2028': 'u2028', // Line separator
    '\u2029': 'u2029'  // Paragraph separator
  };

  // RegExp pattern
  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    /**
      '      => \\'
      \\     => \\\\
      \r     => \\r
      \n     => \\n
      \u2028 => \\u2028
      \u2029 => \\u2029
    **/
    return '\\' + escapes[match];
  };

  // 将 JavaScript 模板编译为可以用于页面呈现的函数
  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  // oldSettings 参数为了兼容 underscore 旧版本
  // setting 参数可以用来自定义字符串模板（但是 key 要和 _.templateSettings 中的相同，才能 overridden）
  // 1. <%  %> - to execute some code
  // 2. <%= %> - to print some value in template
  // 3. <%- %> - to print some values HTML escaped
  // Compiles JavaScript templates into functions
  // _.template(templateString, [settings])
  _.template = function(text, settings, oldSettings) {
    // 兼容旧版本
    if (!settings && oldSettings)
      settings = oldSettings;

    // 相同的 key，优先选择 settings 对象中的
    // 其次选择 _.templateSettings 对象中的
    // 生成最终用来做模板渲染的字符串
    // 自定义模板优先于默认模板 _.templateSettings
    // 如果定义了相同的 key，则前者会覆盖后者
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    // 正则表达式 pattern，用于正则匹配 text 字符串中的模板字符串
    // /<%-([\s\S]+?)%>|<%=([\s\S]+?)%>|<%([\s\S]+?)%>|$/g
    // 注意最后还有个 |$
    var matcher = RegExp([
      // 注意下 pattern 的 source 属性
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    // 编译模板字符串，将原始的模板字符串替换成函数字符串
    // 用拼接成的函数字符串生成函数（new Function(...)）
    var index = 0;

    // source 变量拼接的字符串用来生成函数
    // 用于当做 new Function 生成函数时的函数字符串变量
    // 记录编译成的函数字符串，可通过 _.template(tpl).source 获取（_.template(tpl) 返回方法）
    var source = "__p+='";

    // replace 函数不需要为返回值赋值，主要是为了在函数内对 source 变量赋值
    // 将 text 变量中的模板提取出来
    // match 为匹配的整个串
    // escape/interpolate/evaluate 为匹配的子表达式（如果没有匹配成功则为 undefined）
    // offset 为字符匹配（match）的起始位置（偏移量）
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      // \n => \\n
      source += text.slice(index, offset).replace(escaper, escapeChar);
      // 改变 index 值，为了下次的 slice
      index = offset + match.length;

      if (escape) {
        // 需要对变量进行编码（=> HTML 实体编码）
        // 避免 XSS 攻击
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        // 单纯的插入变量
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        // 可以直接执行的 JavaScript 语句
        // 注意 "__p+="，__p 为渲染返回的字符串
        source += "';\n" + evaluate + "\n__p+='";
      }
      // Adobe VMs need the match returned to produce the correct offset.
      // return 的作用是？
      // 将匹配到的内容原样返回（Adobe VMs 需要返回 match 来使得 offset 值正常）
      return match;
    });

    source += "';\n";
    // By default, `template` places the values from your data in the local scope via the `with` statement.
    // However, you can specify a single variable name with the variable setting.
    // This can significantly improve the speed at which a template is able to render.
    // If a variable is not specified, place data values in local scope.
    // 指定 scope
    // 如果设置了 settings.variable，能显著提升模板的渲染速度
    // 否则，默认用 with 语句指定作用域
    if (!settings.variable)
      source = 'with(obj||{}){\n' + source + '}\n';

    // 增加 print 功能
    // __p 为返回的字符串
    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      // render 方法，前两个参数为 render 方法的参数
      // obj 为传入的 JSON 对象，传入 _ 参数使得函数内部能用 Underscore 的函数
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      // 抛出错误
      e.source = source;
      throw e;
    }

    // 返回的函数
    // data 一般是 JSON 数据，用来渲染模板
    var template = function(data) {
      // render 为模板渲染函数
      // 传入参数 _ ，使得模板里 <%  %> 里的代码能用 underscore 的方法
      //（<%  %> - to execute some code）
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    // template.source for debug?
    // obj 与 with(obj||{}) 中的 obj 对应
    var argument = settings.variable || 'obj';

    // 可通过 _.template(tpl).source 获取
    // 可以用来预编译，在服务端预编译好，直接在客户端生成代码，客户端直接调用方法
    // 这样如果出错就能打印出错行
    // Precompiling your templates can be a big help when debugging errors you can't reproduce.
    // This is because precompiled templates can provide line numbers and a stack trace,
    // something that is not possible when compiling templates on the client.
    // The source property is available on the compiled template function for easy precompilation.
    // see @http://stackoverflow.com/questions/18755292/underscore-js-precompiled-templates-using
    // see @http://stackoverflow.com/questions/13536262/what-is-javascript-template-precompiling
    // see @http://stackoverflow.com/questions/40126223/can-anyone-explain-underscores-precompilation-in-template
    // JST is a server-side thing, not client-side.
    // This mean that you compile Unserscore template on server side by some server-side script and save the result in a file.
    // Then use this file as compiled Unserscore template.
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  // 使支持链式调用
  /**
  // 非 OOP 调用 chain
  _.chain([1, 2, 3])
    .map(function(a) { return a * 2; })
    .reverse().value(); // [6, 4, 2]
  // OOP 调用 chain
  _([1, 2, 3])
    .chain()
    .map(function(a){ return a * 2; })
    .first()
    .value(); // 2
  **/
  _.chain = function(obj) {
    // 无论是否 OOP 调用，都会转为 OOP 形式
    // 并且给新的构造对象添加了一个 _chain 属性
    var instance = _(obj);

    // 标记是否使用链式操作
    instance._chain = true;

    // 返回 OOP 对象
    // 可以看到该 instance 对象除了多了个 _chain 属性
    // 其他的和直接 _(obj) 的结果一样
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // OOP
  // 如果 `_` 被当做方法（构造函数）调用, 则返回一个被包装过的对象
  // 该对象能使用 underscore 的所有方法
  // 并且支持链式调用

  // Helper function to continue chaining intermediate results.
  // 一个帮助方法（Helper function）
  var result = function(instance, obj) {
    // 如果需要链式操作，则对 obj 运行 _.chain 方法，使得可以继续后续的链式操作
    // 如果不需要，直接返回 obj
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  // 可向 underscore 函数库扩展自己的方法
  // obj 参数必须是一个对象（JavaScript 中一切皆对象）
  // 且自己的方法定义在 obj 的属性上
  // 如 obj.myFunc = function() {...}
  // 形如 {myFunc: function(){}}
  // 之后便可使用如下: _.myFunc(..) 或者 OOP _(..).myFunc(..)
  _.mixin = function(obj) {
    // 遍历 obj 的 key，将方法挂载到 Underscore 上
    // 其实是将方法浅拷贝到 _.prototype 上
    _.each(_.functions(obj), function(name) {
      // 直接把方法挂载到 _[name] 上
      // 调用类似 _.myFunc([1, 2, 3], ..)
      var func = _[name] = obj[name];

      // 浅拷贝
      // 将 name 方法挂载到 _ 对象的原型链上，使之能 OOP 调用
      _.prototype[name] = function() {
        // 第一个参数
        var args = [this._wrapped];

        // arguments 为 name 方法需要的其他参数
        push.apply(args, arguments);
        // 执行 func 方法
        // 支持链式操作
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  // 将前面定义的 underscore 方法添加给包装过的对象
  // 即添加到 _.prototype 中
  // 使 underscore 支持面向对象形式的调用
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  // 将 Array 原型链上有的方法都添加到 underscore 中
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);

      if ((name === 'shift' || name === 'splice') && obj.length === 0)
        delete obj[0];

      // 支持链式操作
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  // 添加 concat、join、slice 等数组原生方法给 Underscore
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

}.call(this));