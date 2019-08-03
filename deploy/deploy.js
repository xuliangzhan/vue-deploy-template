const fs = require('fs')
const path = require('path')
const pack = require('../package.json')
const XEUtils = require('xe-utils')
const chalk = require('chalk')
const ora = require('ora')
const NodeSSH = require('node-ssh')
const argvs = process.argv.slice(2)

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

function getParams (key) {
  let item = argvs.find(item => item.split('=')[0] === key)
  return item ? item.split('=') : []
}

function getCommandParams (key, name) {
  if (getParams(key)[1]) {
    return {
      [name]: getParams(key)[1]
    }
  }
  return null
}

/**
 * 前端工程一键部署
 * 使用 WinSCP 工具
 *
 * 命令：npm run deploy u=root p=123456
 * 命令：npm run deploy
 */
let defOpts = {
  serverAddr: '127.0.0.1', // 服务器IP
  serverPort: '22', // ftp、sftp端口
  // userName: null, // 服务器用户名
  // password: null, // 服务器密码
  uploadPath: `/home/upload`, // 包发布历史存放目录
  libName: `dist.zip`, // 包名
  websitePath: `/home/website/${pack.name}/www`, // 项目部署站点路径
  websiteName: null // 自定义项目目录，默认使用项目名
}

function uploadDeploy (options) {
  let progressNum = 1
  let progressText = 'Auto deploy'
  let spinner = ora(`[${progressNum}%] ${progressText} ...`)
  let spInterval = setInterval(() => {
    if (progressNum < 99) {
      progressNum += XEUtils.random(1, 2)
    }
    spinner.text = `[${progressNum}%] ${progressText} ...\n`
  }, 1000)
  spinner.start()
  for (let key of ['userName', 'password', 'serverAddr', 'serverPort', 'uploadPath', 'websitePath']) {
    if (!options[key]) {
      throw new Error(`The ${key} cannot be empty. type=${options[key]}`)
    }
  }
  let startTime = Date.now()
  let websiteName = options.websiteName || pack.name
  let libName = options.libName
  let uploadPath = options.uploadPath.replace(/\/?$/, '')
  let websitePath = options.websitePath.replace(/\/?$/, '')
  let datetime = XEUtils.toDateString(startTime, 'yyyyMMddHHmmss')
  let ssh = new NodeSSH()
  progressText = 'Begin to connect'
  ssh.connect({
    host: options.serverAddr,
    port: options.serverPort,
    username: options.userName,
    password: options.password
  }).then(() => {
    progressText = 'Connection successful.'
    progressNum = Math.max(progressNum, 10)
    let uploadDir = uploadPath.substring(0, uploadPath.lastIndexOf('/'))
    let uploadNextPath = uploadPath.substring(uploadPath.lastIndexOf('/'), uploadPath.length)
    let websiteDir = websitePath.substring(0, websitePath.lastIndexOf('/'))
    let websiteNextPath = websitePath.substring(websitePath.lastIndexOf('/'), websitePath.length)
    return ssh.execCommand(`
    if [ ! -d ${uploadDir} ]; then
      mkdir ${uploadDir};
    fi
    if [ ! -d ${uploadDir}/${uploadNextPath} ]; then
      mkdir ${uploadDir}/${uploadNextPath};
    fi
    if [ ! -d ${uploadDir}/${uploadNextPath}/${websiteName} ]; then
      mkdir ${uploadDir}/${uploadNextPath}/${websiteName};
    fi
    if [ ! -d ${websiteDir} ]; then
      mkdir ${websiteDir};
    fi
    if [ ! -d ${websiteDir}/${websiteNextPath} ]; then
      mkdir ${websiteDir}/${websiteNextPath};
    fi
    `).then(() => {
      progressText = 'Lib uploaded'
      progressNum = Math.max(progressNum, 20)
      return ssh.putFile(resolve(libName), `${uploadDir}/${uploadNextPath}/${websiteName}/${libName}`)
    }).then(() => {
      progressText = 'Begin to deploy'
      progressNum = Math.max(progressNum, 90)
      return ssh.execCommand(`
      if [ -d ${websiteDir}/${websiteNextPath}/${websiteName} ]; then
        rm -rf ${websiteDir}/${websiteNextPath}/${websiteName};
      fi
      unzip ${uploadDir}/${uploadNextPath}/${websiteName}/${libName} -d ${websiteDir}/${websiteNextPath}/${websiteName}
      `)
    })
  })
    .then(() => {
      let color = `rgb(0,255,0)`
      let dateDiff = XEUtils.getDateDiff(startTime, Date.now())
      let deployTime = `${String(dateDiff.HH).padStart(2, 0)}:${String(dateDiff.mm).padStart(2, 0)}:${String(dateDiff.ss).padStart(2, 0)}`
      progressText = 'Deploy complete'
      progressNum = Math.max(progressNum, 100)
      ssh.dispose()
      setTimeout(() => {
        console.log(chalk`\n{bold.${color} Project Name:} ${websiteName}\n{bold.${color} Version:} ${pack.version}\n{bold.${color} Server:} ${options.type}://${options.serverAddr}:${options.serverPort}\n{bold.${color} Lib Path:} ${uploadPath}/${websiteName}/${libName}\n{bold.${color} Project Path:} ${websitePath}/${websiteName}\n{bold.${color} Datetime:} ${datetime}\n{bold.${color} Deploy Time:} ${deployTime}\n`)
        spinner.stop()
        clearInterval(spInterval)
      }, 1000)
    }).catch(e => {
      ssh.dispose()
      spinner.stop()
      clearInterval(spInterval)
      return Promise.reject(e)
    })
}

uploadDeploy(
  Object.assign(defOpts, {
    ...getCommandParams('u', 'userName'),
    ...getCommandParams('p', 'password'),
    ...getCommandParams('addr', 'serverAddr'),
    ...getCommandParams('port', 'serverPort')
  })
)
