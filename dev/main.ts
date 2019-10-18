import Vue from 'vue'
// @ts-ignore
import App from './App.vue'
import CompositionApi from '@vue/composition-api'
import './assets/sass/tailwind.sass'

Vue.use(CompositionApi)

new Vue({
  render: h => h(App),
}).$mount('#app')