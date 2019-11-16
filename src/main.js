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

import {library} from '@fortawesome/fontawesome-svg-core'
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
