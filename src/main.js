import Vue from 'vue'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import VueMultiselect from 'vue-multiselect'
import ToggleButton from 'vue-js-toggle-button'
import GoJs from 'gojs'
import io from 'socket.io-client'

Vue.prototype.$socketIO = io;
// register globally

import {library} from '@fortawesome/fontawesome-svg-core'
import {
  faSearch,
  faCog,
  faFilter,
  faPlayCircle,
  faStar,
  faBriefcase,
  faTrash,
  faSync
} from '@fortawesome/free-solid-svg-icons'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '../public/main.css'
import "vue-multiselect/dist/vue-multiselect.min.css"
Vue.prototype.mainColor= "#2c3e50",
Vue.prototype.interestColor= '#FDDC17',
Vue.prototype.lightColor= "rgb(150,150,150)",
Vue.prototype.redColor= "#ff6a6a",
Vue.prototype.greenColor= "#41B883",
// Vue.prototype.back_url = "http://vps758172.ovh.net:8080"
Vue.prototype.back_url = "http://localhost:8080"

library.add(faSearch)
library.add(faCog)
library.add(faFilter)
library.add(faStar)
library.add(faBriefcase)
library.add(faTrash)
library.add(faSync)
library.add(faPlayCircle)

Vue.use(ToggleButton)
Vue.component('vue-multiselect', VueMultiselect)
Vue.use(VueAxios, axios)
Vue.prototype.$ = axios
Vue.use(BootstrapVue)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.config.productionTip = false


new Vue({
  render: h => h(App),
}).$mount('#app')
