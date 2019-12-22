import Vue from 'vue'
import XEUtils from 'xe-utils'

// 挂载到 vue 实例中
Vue.prototype.$utils = XEUtils

// 混合自定义函数
XEUtils.mixin(utils)
