const pack = require('../package.json')
const http = require('http')
const url = require('url')
const fs = require('fs')
const mines = require('./mine').types
const path = require('path')
const httpProxy = require('http-proxy')
const chalk = require('chalk')

const rootDir = 'dist'
const index = 'index.html'
const targetPath = 'https://127.0.0.1'
const PORT = 80
const proxy = httpProxy.createProxyServer({
    ws: true,
    secure: false,
    changeOrigin: true,
    target: targetPath
})

proxy.on('error', (err, req, res) => {
    res.writeHead(500, {
        'content-type': 'text/plain'
    })
    res.end(err ? err.message : 'Something went wrong. And we are reporting a custom error message.')
})

const server = http.createServer((request, response) => {
    let pathname = url.parse(request.url).pathname
    let realPath = path.join(`./${rootDir}/`, pathname === '/' ? index : pathname)
    let ext = path.extname(realPath)
    ext = ext ? ext.slice(1) : 'unknown'
    // console.log(`pathname: ${pathname}     realPath: ${realPath}`);
    if (/\/(websocket|servlet|services)\//.test(pathname)) {
        proxy.web(request, response)
    } else {
        fs.stat(realPath, (error, stats) => {
            if (error) {
                ext = 'html'
                realPath = path.join(`./${rootDir}/`, index)
            }
            fs.readFile(realPath, 'binary', (err, file) => {
                if (err) {
                    response.writeHead(500, {
                        'Content-Type': 'text/plain'
                    })
                    response.end(err)
                } else {
                    let contentType = mines[ext] || 'text/plain'
                    response.writeHead(200, {
                        'Content-Type': contentType
                    })
                    response.write(file, 'binary')
                    response.end()
                }
            })
        })
    }
})

server.listen(PORT)
console.log(chalk.green(`[${pack.name}] 生产包启动成功!`))
console.log(chalk.green(`[${pack.name}] 代理服务：${targetPath}`))
console.log(chalk.yellow(`[${pack.name}] 访问路径： http://localhost:${PORT}`))
