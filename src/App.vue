<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  created () {
    this.init()
  },
  methods: {
    init () {
      this.onInterceptors()
    },
    onInterceptors () {
      // 请求之前拦截器
      this.$ajax.interceptors.request.use((request, next) => {
        next()
      })
      // 响应之后拦截器
      this.$ajax.interceptors.response.use((response, next) => {
        next()
      }, (e, next) => {
        next()
      })
    }
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}
#app {
  height: 100%;
  display: flex;
}
</style>
