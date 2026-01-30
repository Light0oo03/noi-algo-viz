import { createApp } from 'vue'
import VueKonva from 'vue-konva'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import pinia from './stores'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(pinia)
app.use(VueKonva)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
