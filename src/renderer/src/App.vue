<template>
  <n-config-provider :theme="darkTheme">
    <div class="hbox">
      <div class="vbox">
        <SideBar @toggle="toggleMainView" @sidebar-toggle="sidebarToggled" />
        <KeepAlive>
          <Editor ref="edtior" :show="currentMainView == 'editor' || visibleEditor" />
        </KeepAlive>
        <KeepAlive>
          <Term ref="term" :show="currentMainView == 'term' && !visibleEditor" />
        </KeepAlive>
      </div>
      <StatusBar ref="statusBar" />
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme, NConfigProvider } from 'naive-ui'
import { computed, inject, onMounted, ref } from 'vue'
import * as appkey from './AppKey'
import Term from './components/Term.vue'
import Editor from './components/Editor.vue'
import StatusBar from './layout/StatusBar.vue'
import SideBar from './layout/SideBar.vue'
const statusBar = ref<InstanceType<typeof StatusBar>>()
const term = ref<InstanceType<typeof Term>>()
const position = inject(appkey.editorPositon)
const lang = inject(appkey.editorLanguage)
const currentMainView = ref('edtior')
const visibleEditor = ref(true)
function toggleMainView(tab) {
  if (currentMainView.value == tab) {
    visibleEditor.value = !visibleEditor.value
  } else {
    visibleEditor.value = false
    currentMainView.value = tab
  }
}
function sidebarToggled() {
  term.value?.resize()
  console.log('resizede')
}
onMounted(() => {
  if (statusBar.value) {
    statusBar.value.leftRegist({
      text: computed(() => lang?.value || '未选择语言'),
      click: async () => {
        const result = await window.api.menu.langChoose()
        if (lang && result) {
          lang.value = result
        }
      }
    })
    statusBar.value.rightRegist({
      text: computed(() => `行 ${position?.lineNumber || 0}，列 ${position?.column || 0}`),
      click: () => {
        console.log('click')
      }
    })
  }
})
// const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<style>
@import url('./assets/iconfont.css');
</style>
