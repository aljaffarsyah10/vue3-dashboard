// import { createApp } from 'vue'
// import App from './App.vue'

// createApp(App).mount('#app')

import { createApp } from "vue";
import App from "./App.vue";
import { Laue } from "laue";
import Chart from "chart.js";
import VueChartkick from "vue-chartkick";

const app = createApp(App);

app.use(Laue);
app.use(VueChartkick, {
  adapter: Chart,
});

app.mount("#app");
