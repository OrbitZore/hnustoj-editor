<template>
  <div class="hbox">
    <div class="vbox">
      <SideBar />
      <Editor />
    </div>
    <StatusBar ref="statusBar" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import * as appkey from './AppKey'
import Editor from './components/Editor.vue'
import StatusBar from './layout/StatusBar.vue'
import SideBar from './layout/SideBar.vue'
const statusBar = ref<InstanceType<typeof StatusBar>>()
const position = inject(appkey.editorPositon)
const lang = inject(appkey.editorLanguage)
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
