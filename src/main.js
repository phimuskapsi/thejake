import 'zingchart/es6';
import Vue from 'vue'
import App from './App.vue'
import zingchartVue from 'zingchart-vue';
import vuetify from './plugins/vuetify';
import VueRouter from 'vue-router';

import CurrentJake from './components/CurrentJake';
import HistoricalJakes from './components/HistoricalJakes';

//import MainContent from './components/MainContent';
// Main project plugins
import '@fortawesome/fontawesome-free/css/all.min.css';

Vue.config.productionTip = false;
Vue.component('zingchart', zingchartVue)
Vue.use(VueRouter);

const routes = [
  { path: '/', component: CurrentJake },
  { path: '/history', component: HistoricalJakes },
];

const router = new VueRouter({
  routes
});

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
