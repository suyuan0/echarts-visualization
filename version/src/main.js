import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import './assets/font/iconfont.css'
import './assets/css/global.scss'
import SocketService from '@/utils/socket_service'
// 对服务端进行websocket连接
SocketService.Instance.connect()
Vue.prototype.$socket = SocketService.Instance
// 请求基地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api'
// 全局注册
Vue.prototype.$http = axios
Vue.prototype.$echarts = window.echarts
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
