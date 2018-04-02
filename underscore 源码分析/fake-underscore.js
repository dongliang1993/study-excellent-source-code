(() => {
  const _ = function (obj) {
    if (!(this instanceof _)) {
      return new _(obj)
    }
    return obj
  }

  _.noop = () => {}

  _.random = (min = 0, max) => {
    if (max < min) {
      throw new Error('最大值不能小于最小值!')
    }
    return  min + Math.floor((Math.random() * (max - min + 1)))
  }
  return _
})()