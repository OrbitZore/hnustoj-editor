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
    </div>
    <template v-if="visible">
      <KeepAlive>
        <component :is="tabs[currentTab]" class="tab"></component>
      </KeepAlive>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import OJViewer from '../components/OJViewer/main'
import VersionCtrl from '../components/VersionCtrl/main'
const tabs = { OJViewer, VersionCtrl }
const currentTab = ref('OJViewer')
const visible = ref(true)
function clicked(tab) {
  if (currentTab.value === tab) {
    visible.value = !visible.value
  } else {
    currentTab.value = tab
    visible.value = true
  }
}
</script>

<style>
.sidepannel {
  background-color: #22252b;
  color: #d8dadf;
}
</style>
<style scoped>
.sidepannel {
  flex: 0;
}
.sidebar {
  display: flex;
  flex: 0;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  border-right: 1px solid #e0e0e0;
}
.sidebar-button {
  flex: 0;
  cursor: pointer;
  background-color: transparent;
  border: none;
  margin: 5px 0;
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
  width: 400px;
}
</style>
