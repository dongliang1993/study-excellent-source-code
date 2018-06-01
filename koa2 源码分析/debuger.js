const Koa = require('./lib/application')
const app = new Koa()

app.use(async (ctx, next) => {
  console.log(`${ctx.request.url} ${ctx.request.method}`)
  await next()
})

app.use(async (ctx, next) => {
  console.log(`hello world !`)
  await next()
})

app.listen(3000, () => {
  console.log('server listening at 3000 port!')
})