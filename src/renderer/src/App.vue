<template>
  <div class="hbox">
    <div class="vbox">
      <div>asafafs</div>
      <Editor />
    </div>
    <StatusBar ref="statusBar" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import * as appkey from './AppKey'
import Editor from './components/Editor.vue'
import StatusBar from './components/StatusBar.vue'
const statusBar = ref<InstanceType<typeof StatusBar>>()
const position = inject(appkey.editorPositon)
onMounted(() => {
  if (statusBar.value) {
    statusBar.value.leftRegist({
      text: 'C/C++',
      click: () => {
        console.log('click')
      }
    })
    statusBar.value.leftRegist({
      text: 'C/C++',
      click: () => {
        console.log('click')
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
