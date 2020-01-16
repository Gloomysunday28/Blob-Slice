const path = require('path')
const fs = require('fs')
const Koa = require('Koa')
const body = require('koa-body')
const Router = require('koa-router')
const app = new Koa()
const static = require('koa-static')

app.use(body({
  multipart: true // 是否支持multipart-formdata表单数据，
}))
app.use(static(path.resolve(__dirname, '../frontend')))

const router = new Router()
router.post('/', async (ctx) => {
  const { chunk } = ctx.request.files
  const { hash } = ctx.request.body
  const chunkDir = path.resolve(__dirname, './files', `${hash}`);
  await fs.createReadStream(chunk.path).pipe(fs.createWriteStream(chunkDir, 'utf-8'))
  ctx.status = 200
  ctx.body = {
    status: 200,
    message: 'Ok'
  }
})

router.post('merge', async (ctx) => {
  const chunkDir = path.resolve(__dirname, './files')
  const mergePath = path.resolve(__dirname, 'merge/线上IP信息.xlsx')
  await fs.writeFileSync(mergePath, "")
  fs.readdir(chunkDir, (err, files) => {
    files.forEach(async file => {
      await fs.appendFileSync(mergePath, fs.readFileSync(path.resolve(chunkDir, file)))
    })
  })
  
  ctx.body = {
    status: 200,
    message: 'Ok'
  }
})

router.use('/', router.routes(), router.allowedMethods())

app.use(router.routes()).use(router.allowedMethods())
app.listen(3000, () => console.log("正在监听 3000 端口"))