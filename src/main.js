import Vue from 'vue'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import {
  FontAwesomeIcon
} from '@fortawesome/vue-fontawesome'
import VueMultiselect from 'vue-multiselect'
import GoJs from 'gojs'
import io from 'socket.io-client'

Vue.prototype.$socketIO = io;
// register globally

Vue.prototype.copyNestedObject =  function pf(obj) {
  var self = this;
  let type = obj.constructor
  switch (type) {
    case Number:
      return obj;
      break;
    case Boolean:
      return obj;
      break;
    case String:
      return obj;
      break;
    case Array:
      return obj.map(cell => pf(cell))
      break;
    case Object:
      Object.keys(obj).map(key => {
        obj[key] = pf(obj[key])
      })
			return obj
      break;
  }
}

import {
  library
} from '@fortawesome/fontawesome-svg-core'
import {
  faSearch
} from '@fortawesome/free-solid-svg-icons'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '../public/main.css'
import "vue-multiselect/dist/vue-multiselect.min.css"


library.add(faSearch)


Vue.component('vue-multiselect', VueMultiselect)
Vue.use(VueAxios, axios)
Vue.prototype.$ = axios
Vue.use(BootstrapVue)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.config.productionTip = false


new Vue({
  render: h => h(App),
}).$mount('#app')
