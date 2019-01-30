/**
 * Get the first item that pass the test
 * by second argument function
 *
 * @param {Array} list
 * @param {Function} f
 * @return {*}
 */
// 原生 find 的实现
// 找到第一个满足条件的值
function find (list, f) {
  return list.filter(f)[0]
}

/**
 * Deep copy the given object considering circular structure.
 * This function caches all nested objects and its copies.
 * If it detects circular structure, use cached copy to avoid infinite loop.
 *
 * @param {*} obj
 * @param {Array<Object>} cache
 * @return {*}
 */
// 深拷贝
// 如果检测到环，
export function deepCopy (obj, cache = []) {
  // just return if obj is immutable value
  // undefined、null、number、string、boolean、function 等类型直接返回
  // 对于基础类型其实就已经是 copy 了
  // 但是对于 Function，其实还是保留的引用
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // if obj is hit, it is in circular structure
  // 查看有没有命中缓存
  // 没有找到的话，hit 是 undefined
  // 如果找到了，hit 是一个 object，身上有 original 和 copy 两部分
  const hit = find(cache, c => c.original === obj)
  if (hit) {
    return hit.copy
  }

  // 判断是 array 还是 object
  const copy = Array.isArray(obj) ? [] : {}
  // put the copy into cache at first
  // because we want to refer it in recursive deepCopy
  // cache 只会处理复杂数据类型
  cache.push({
    original: obj,
    copy
  })

  // 真骚，array 也是可以通过这种方式来迭代的
  // eg Object.keys([1,2,4]) -> ['0','1','2']
  Object.keys(obj).forEach(key => {
    copy[key] = deepCopy(obj[key], cache)
  })

  return copy
}

/**
 * forEach for object
 */
// 获取对象可迭代的属性，然后循环遍历
export function forEachValue (obj, fn) {
  Object.keys(obj).forEach(key => fn(obj[key], key))
}

// 判断是否是 Object
export function isObject (obj) {
  // typeof null  也是 'object',所以要排除 null 的影响
  return obj !== null && typeof obj === 'object'
}

// 判断是否是 Promise
// 其实就是判断是否有 then 函数(thenable)
export function isPromise (val) {
  return val && typeof val.then === 'function'
}

// 断言函数
// 如果没有 condition ，就 throw 出来对一个 error
// error 上回携带 msg ，这个 msg 是自己根据情况来传进去的
export function assert (condition, msg) {
  if (!condition) throw new Error(`[vuex] ${msg}`)
}
