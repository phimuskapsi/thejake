import "zingchart/es6";
import Vue from "vue";
import App from "./App.vue";
import "zingchart/es6";
import zingchartVue from "zingchart-vue";
import vuetify from "./plugins/vuetify";
import VueRouter from "vue-router";

import CurrentJake from "./components/CurrentJake";
import HistoricalJakes from "./components/HistoricalJakes";
import JakeTables from "./components/JakeTables";
import PowerRankings from "./components/PowerRankings";
import TheWorst from "./components/TheWorst";
import UltimateJake from "./components/UltimateJake";

/* Auth Stuff */
import Amplify, { Auth } from "aws-amplify";
import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);

/* Amplify UI */
import "@aws-amplify/ui-components";
import {
  applyPolyfills,
  defineCustomElements
} from "@aws-amplify/ui-components/loader";

applyPolyfills().then(() => {
  defineCustomElements(window);
});

//import MainContent from './components/MainContent';
// Main project plugins
import "@fortawesome/fontawesome-free/css/all.min.css";

Vue.config.productionTip = false;
Vue.config.ignoredElements = [/amplify-\w*/];
Vue.component("zingchart", zingchartVue);
Vue.use(VueRouter);

const routes = [
  { path: "/", component: CurrentJake },
  { path: "/history", component: HistoricalJakes },
  { path: "/graf", component: PowerRankings },
  { path: "/tables", component: JakeTables },
  { path: "/ultimate", component: UltimateJake },
  { path: "/worst", component: TheWorst }
];

const router = new VueRouter({
  routes
});

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
