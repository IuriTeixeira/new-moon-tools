import { createApp } from 'vue'
import router from './router'
import App from './App.vue'

import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
const customBulmaConfig = {
	...bulmaConfig,
}
import '@mdi/font/css/materialdesignicons.css'
import '@oruga-ui/theme-oruga/dist/oruga.css'
import '@oruga-ui/theme-bulma/dist/bulma.css'
import './assets/styles/main.scss'

const app = createApp(App)
app.use(router)
app.use(Oruga)

app.mount('#app')
