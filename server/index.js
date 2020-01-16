const path = require('path')
const fs = require('fs')
const Koa = require('Koa')
const body = require('koa-body')
const Router = require('koa-router')
const app = new Koa()
const fse = require("fs-extra");
const static = require('koa-static')
const UPLOAD_DIR = path.resolve(__dirname, "..", "target")
app.use(body({
  multipart: true // 是否支持multipart-formdata表单数据，
}))
app.use(static(path.resolve(__dirname, '../frontend')))

const router = new Router()
router.post('/', async (ctx) => {
  const { chunk } = ctx.request.files
  const { filename, hash } = ctx.request.body
  const chunkDir = path.resolve(__dirname, './files', `${hash}`);
  fs.createReadStream(chunk.path).pipe(fs.createWriteStream(chunkDir))
  ctx.body = {
    status: 200,
    message: 'Ok'
  }
})

router.post('merge', async (ctx) => {
  const chunkDir = path.resolve(__dirname, './files')
  const mergePath = path.resolve(__dirname, 'merge/merge.xlsx')
  await fs.writeFile(mergePath, "")
  fs.readdir(chunkDir, (err, files) => {
    console.log(files)
    files.forEach(async file => {
      fs.appendFile(mergePath, await fs.readFileSync(path.resolve(chunkDir, file), 'utf-8'))
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