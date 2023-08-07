// /* eslint-disable */
// import Vue from 'vue';
// import '@/assets/css/colors.scss';
// import { library } from '@fortawesome/fontawesome-svg-core';
// import { fas } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// import Croppa from 'vue-croppa';
// 
// import BootstrapVue from 'bootstrap-vue';
// import store from './store/store';
// import router from './routers/router';
// import App from './App.vue';
// 
// import 'bootstrap/dist/css/bootstrap.css';
// import 'bootstrap-vue/dist/bootstrap-vue.css';
// 
// import '@/assets/css/global.scss';
// import '@/assets/css/overrides.scss';
// import 'vue-croppa/dist/vue-croppa.css';
// 
// import VueScrollTo from 'vue-scrollto';
// import Notifications from 'vue-notification';
// 
// // This is not actual VueAxios npm package. It is from @/plugins/axios.js
// import VueAxios from './plugins/axios';
// import _ from 'lodash';
// 
// import { Datetime } from 'vue-datetime';
// // You need a specific loader for CSS files
// import 'vue-datetime/dist/vue-datetime.css';
// 
// Vue.component('datetime', Datetime);
// 
// import AutocompleteVue from 'autocomplete-vue';
// 
// Vue.component('autocomplete-vue', AutocompleteVue);
// 
// import 'animate.css';
// 
// // Vue.use(VueScrollTo)
// Vue.use(Notifications);
// //Vue Toggle Button
// import ToggleButton from 'vue-js-toggle-button';
// Vue.use(ToggleButton);
// Vue.use(Croppa);
// 
// // You can also pass in the default options
// Vue.use(VueScrollTo, {
//  container: 'body',
//  duration: 500,
//  easing: 'ease-in-out',
//  offset: 0,
//  force: true,
//  cancelable: true,
//  onStart: false,
//  onDone: false,
//  onCancel: false,
//  x: false,
//  y: true
// });
// 
// library.add(fas);
// 
// Vue.component('font-awesome-icon', FontAwesomeIcon);
// Vue.use(BootstrapVue);
// 
// Vue.config.productionTip = false;
// 
// new Vue({
//  router,
//  store,
//  render: h => h(App)
// }).$mount('#app');

// Vue js 3 version code 
/* eslint-disable */
import { createApp } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Croppa from 'vue-croppa';

import { createStore } from 'vuex'; // Import the new Vuex store creation method
import router from './routers/router';
import App from './App.vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import '@/assets/css/colors.scss';
import '@/assets/css/global.scss';
import '@/assets/css/overrides.scss';
import 'vue-croppa/dist/vue-croppa.css';
import 'vue-datetime/dist/vue-datetime.css';
import 'animate.css';

import VueScrollTo from 'vue-scrollto';
import Notifications from 'vue-notification';
import VueAxios from './plugins/axios';
import _ from 'lodash';

import { Datetime } from 'vue-datetime';

import AutocompleteVue from 'autocomplete-vue';
import ToggleButton from 'vue-js-toggle-button';

// Create the Vue app instance
const app = createApp(App);

// Install plugins
app.use(router);
app.use(VueAxios);
app.use(Croppa);
app.use(Notifications);
app.use(VueScrollTo, {
	container: 'body',
	duration: 500,
	easing: 'ease-in-out',
	offset: 0,
	force: true,
	cancelable: true,
	onStart: false,
	onDone: false,
	onCancel: false,
	x: false,
	y: true
});
app.component('datetime', Datetime);
app.component('font-awesome-icon', FontAwesomeIcon);
app.component('autocomplete-vue', AutocompleteVue);
app.use(ToggleButton);

// Register global styles and font-awesome icons
library.add(fas);

// Create the Vuex store
const store = createStore({
	// Your Vuex store options here
});

app.use(store);

// Mount the app
app.mount('#app');
