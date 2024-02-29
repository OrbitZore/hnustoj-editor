<template>
  <div class="vbox">
    <div>asafafs</div>
    <Editor />
  </div>
  <StatusBar ref="statusBar" />
</template>

<script lang="ts">
import { ref } from 'vue'
import Editor from './components/Editor.vue'
import StatusBar from './components/StatusBar.vue'

export default {
  name: 'App',
  components: {
    Editor,
    StatusBar
  },
  setup() {
    const statusBar = ref<InstanceType<typeof StatusBar>>()
    return {
      statusBar
    }
  },
  mounted(this) {}
}
// const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>
