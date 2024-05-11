import './assets/main.css'
import { createApp, reactive, ref } from 'vue'
import App from './App.vue'

const app = createApp(App)
import * as appkey from './AppKey'
app.provide(appkey.editorInitText, ref(''))
app.provide(
  appkey.editorPositon,
  reactive({
    lineNumber: 0,
    column: 0
  })
)
app.provide(appkey.editorLanguage, ref('cpp'))
app.provide(appkey.editorPath, ref('/tmp/test.cpp'))
app.provide(appkey.onlineJudgerKey, ref(null))

app.mount('#app')
