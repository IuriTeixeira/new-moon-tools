import { createApp } from 'vue'
import App from './App.vue'

import Oruga from '@oruga-ui/oruga-next'
import '@mdi/font/css/materialdesignicons.css'

import { bulmaConfig } from '@oruga-ui/theme-bulma'

// import Oruga theme styling
import '@oruga-ui/theme-oruga/dist/oruga.css'
import '@oruga-ui/theme-bulma/dist/bulma.css'

import './assets/styles/main.scss'

const customBulmaConfig = {
	...bulmaConfig,
}

import router from './router'


const vueApp = createApp(App)
	.use(router)
	.use(Oruga)
	.mount('#app')
