<template>
  <div class="sidepannel vbox">
    <div class="sidebar hbox">
      <button v-for="(_, tab) in tabs" :key="tab" class="sidebar-button" @click="clicked(tab)">
        <i
          :class="[
            'iconfont',
            'sidebarfont',
            tabs[tab].Icon,
            tab === currentTab && visible ? 'active' : 'noactive'
          ]"
        ></i>
      </button>
      <div class="sidebar-end" style="margin-top: auto">
        <div class="sidebar-button" @click="$emit('toggle', 'term')">
          <i class="iconfont sidebarfont icon-terminalzhongduan"></i>
        </div>
      </div>
    </div>
    <div
      v-show="visible"
      style="overflow-y: auto; min-width: 300px; height: calc(100vh - 20px); padding: 0 3px"
    >
      <n-scrollbar>
        <KeepAlive>
          <template v-for="(_, tab) in tabs" :key="tab">
            <component :is="tabs[tab]" v-show="tab == currentTab" class="tab"></component>
          </template>
        </KeepAlive>
      </n-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineEmits } from 'vue'
import { NScrollbar } from 'naive-ui'
import { tabs } from '../components/sidebarComponents'
import eventBus from '@lib/eventBus'
const currentTab = ref('OJManager')
const visible = ref(true)
const emit = defineEmits(['toggle', 'sidebar-toggle'])
for (const tab in tabs) {
  window.electron.ipcRenderer.on('menu:toggle' + tab, () => clicked(tab))
}
window.electron.ipcRenderer.on('menu:toggleTerminal', () => emit('toggle', 'term'))
function clicked(tab) {
  if (currentTab.value === tab) {
    visible.value = !visible.value
  } else {
    currentTab.value = tab
    visible.value = true
  }
  emit('sidebar-toggle')
}
eventBus.on('hideSidebar', () => {
  visible.value = false
})
eventBus.on('showSidebar', () => {
  visible.value = true
})
eventBus.on('showSiderbarComponent', (tab) => {
  currentTab.value = tab
  visible.value = true
})
onMounted(() => {
  window.electron.ipcRenderer.on('menu:toggleSidebar', () => {
    visible.value = !visible.value
  })
})
</script>

<style>
.sidepannel {
  background-color: #22252b;
  color: #d8dadf;
  flex: 0 0 0;
}
</style>
<style scoped>
.sidebar {
  display: flex;
  flex: 0 0 0;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  border-right: 1px solid #e0e0e0;
}
.sidebar-end {
  flex: 0 0 0;
}
.sidebar-button {
  flex: 0 0 0;
  cursor: pointer;
  background-color: transparent;
  border: none;
  padding: 8px 5px;
}
.sidebarfont {
  font-size: 32px;
}
.sidebarfont.active {
  color: #d8dadf;
}
.sidebarfont.noactive {
  color: #6b6d73;
}
.tab {
  width: 300px;
}
</style>
