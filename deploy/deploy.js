const pack = require('../package.json')
const XEUtils = require('xe-utils')
const chalk = require('chalk')
const { exec } = require('child_process')
const argvs = process.argv.slice(2)

function getParams (key) {
  let item = argvs.find(item => item.indexOf(key) > -1)
  return item ? item.split('=') : []
}

/**
 * 前端工程一键部署
 * 使用 WinSCP 工具
 *
 * 命令：npm run deploy u=root p=123456
 * 命令：npm run deploy
 */
let defOpts = {
  winSCP: 'C:\\Program Files (x86)\\WinSCP\\WinSCP.exe', // WinSCP安装目录
  serverAddr: '127.0.0.1', // 服务器IP
  serverPort: '22', // ftp、sftp端口
  // userName: null, // 服务器用户名
  // password: null, // 服务器密码
  type: 'sftp', // 传输协议ftp、sftp
  isSaveHistory: true, // 是否保存历史发包记录
  uploadPath: `/home/upload`, // 包发布历史存放目录
  libPath: `./`, // 包的路径
  libName: `dist.zip`, // 包名
  websitePath: `/home/website/${pack.name}/www`, // 项目部署站点路径
  websiteName: null, // 自定义项目目录，默认使用项目名
  log: 'deploy/deploy.log' // 日志
}

function uploadDeploy (options) {
  for (let key of ['type', 'userName', 'password', 'serverAddr', 'serverPort', 'uploadPath', 'websitePath']) {
    if (!options[key]) {
      throw new Error(`The ${key} cannot be empty. type=${options[key]}`)
    }
  }
  let startTime = Date.now()
  let websiteName = options.websiteName || pack.name
  let uploadPath = options.uploadPath.replace(/\/?$/, '')
  let websitePath = options.websitePath.replace(/\/?$/, '')
  let datetime = XEUtils.dateToString(startTime, 'yyyyMMddHHmmss')
  let _saveHistory = options.isSaveHistory === true || options.isSaveHistory === '1' ? ` "call if [ ! -d ${uploadPath}/${websiteName}/history ];then mkdir ${uploadPath}/${websiteName}/history; fi" "call cp ${options.libName} ${uploadPath}/${websiteName}/history/${websiteName}_${pack.version}_${datetime}.zip"` : ''
  let _log = ` "exit" /log=${options.log}`
  let commands = `"${options.winSCP}" /console /command "option confirm off" "open ${options.type}://${options.userName}:${encodeURIComponent(options.password)}@${options.serverAddr}:${options.serverPort}" "option transfer binary" "call if [ ! -d ${uploadPath} ];then mkdir ${uploadPath}; fi" "call if [ ! -d ${uploadPath}/${websiteName} ];then mkdir ${uploadPath}/${websiteName}; fi" "cd ${uploadPath}/${websiteName}" "put ${options.libPath}${options.libName}" "call if [ ! -d ${websitePath} ];then mkdir ${websitePath}; fi" "call rm -rf ${websitePath}/${websiteName}" "call unzip ${options.libName} -d ${websitePath}/${websiteName}"${_saveHistory}${_log}`
  console.log(chalk`{bold.rgb(255,255,0) \n${commands}\n}`)
  exec(commands, (error, stdout, stderr) => {
    let dateDiff = XEUtils.getDateDiff(startTime, Date.now())
    let deployTime = `${String(dateDiff.HH).padStart(2, 0)}:${String(dateDiff.mm).padStart(2, 0)}:${String(dateDiff.ss).padStart(2, 0)}`
    console.log(chalk`{bold.rgb(0,255,0) Project Name:} ${websiteName}\n{bold.rgb(0,255,0) Server:} ${options.type}://${options.serverAddr}:${options.serverPort}\n{bold.rgb(0,255,0) Library:} ${websiteName}_${pack.version}_${datetime}.zip\n{bold.rgb(0,255,0) Project Path:} ${websitePath}/${websiteName}\n{bold.rgb(0,255,0) Deploy Time:} ${deployTime}\n`)
    if (error || deployTime === '00:00:00') {
      throw error
    } else {
      console.log(chalk.cyan(`Deployment success.\n`))
    }
  })
}

function getCommandParams (key, name) {
  if (getParams(key)[1]) {
    return {
      [name]: getParams(key)[1]
    }
  }
  return null
}

uploadDeploy(
  Object.assign(defOpts, {
    ...getCommandParams('u', 'userName'),
    ...getCommandParams('p', 'password'),
    ...getCommandParams('addr', 'serverAddr'),
    ...getCommandParams('port', 'serverPort')
  })
)
