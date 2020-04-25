import Vue from 'vue'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io'

Vue.config.productionTip = false

Vue.use(new VueSocketIO({
  debug: true,
  connection: 'http://gaatvanzelf.nl:2001'
}))

new Vue({
  render: h => h(App)
}).$mount('#app')
