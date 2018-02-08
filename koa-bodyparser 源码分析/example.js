var koa = require('koa');
var bodyParser = require('./koa-bodyparser 注释版');

var app = koa();
app.use(bodyParser());

app.use(async () => {
  // the parsed body will store in this.request.body
  ctx.body = ctx.request.body;
});

app.listen(3000);