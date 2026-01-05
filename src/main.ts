import { createApp } from 'vue'
import VueKonva from 'vue-konva'
import pinia from './stores'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(pinia)
app.use(VueKonva)
app.mount('#app')
