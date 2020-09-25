import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import store from './store'
import router from './router'
import './plugins/element.js'
import Util from "./plugins/util.js"

Vue.config.productionTip = false
Vue.use(Util);

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
