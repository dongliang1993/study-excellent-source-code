axios.js

我们首先翻到文件的最下面，看看导出的是个什么玩意：

```js
.....
.....

function createInstance(defaultConfig) {
	.....
}

var axios = createInstance(defaults);

axios.Axios = Axios;

axios.create = function create(instanceConfig) {
    ......
};

axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
// 原来 axios.all 直接用的原生的
axios.all = function all(promises) {
  return Promise.all(promises);
};
module.exports = axios;
// Allow use of default import syntax in TypeScript
module.exports.default = axios;
```

从整个流程来看，还是比较清楚的。

文件一开始，先引入了一堆文件，然后定义了一个 createInstance 函数，通过这个函数生成了一个实例，取名叫 axios，然后在它身上挂了一些东西，最后把它导出。

根据 axios 文档，使用 axios 发送请求的方式还是很多的，下面归类一下

1. ##### axios(config) 直接使用 axios 函数来进行发布

2. ##### axios(url[, config])

3. 使用别名 axios.get/post/delete ...

所以，我们上面导出的 axios 其实就是一个函数

