const pack = require('../package.json')
const path = require('path')
const FileManagerPlugin = require('filemanager-webpack-plugin')
const XEUtils = require('xe-utils')
const argvs = process.argv.slice(2)

function getParams (key) {
  let item = argvs.find(item => item.indexOf(key) > -1)
  return item ? item.split('=') : []
}

let datetime = XEUtils.dateToString(Date.now(), 'yyyyMMddHHmmss')
let plugins = []

let zipPros = getParams('zip')
if (zipPros.length) {
  plugins.push(new FileManagerPlugin({
    onEnd: {
      delete: [
        path.join(__dirname, `../*.zip`)
      ],
      archive: [{
        source: path.join(__dirname, '../dist'),
        destination: path.join(__dirname, zipPros[1] ? `../${zipPros[1]}.zip` : `../${pack.name}_${pack.version}_${datetime}.zip`)
      }]
    }
  }))
}

module.exports = plugins