import './assets/main.css'

import { createApp, reactive } from 'vue'
import App from './App.vue'

const app = createApp(App)
import * as appkey from './AppKey'

app.provide(appkey.editorInitText, '')
app.provide(
  appkey.editorPositon,
  reactive({
    lineNumber: 0,
    column: 0
  })
)

app.mount('#app')
