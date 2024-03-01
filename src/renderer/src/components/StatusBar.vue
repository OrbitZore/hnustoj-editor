<template>
  <div class="status-bar">
    <div class="left-status">
      {{ props.leftText }}
      <StatusBarElement
        v-for="leftState in leftStates"
        :key="leftState[1]"
        :text="leftState[0].text"
        @click="leftState[0].click"
      />
    </div>
    <div class="right-status">
      <StatusBarElement
        v-for="rightState in rightStates"
        :key="rightState[1]"
        :text="rightState[0].text"
        @click="rightState[0].click"
      />
      {{ props.rightText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { statusBarProps, stateType, statesType } from './StatusBarType'
import StatusBarElement from './StatusBarElement.vue'
import { reactive } from 'vue'
const props = defineProps(statusBarProps)
const leftStates = reactive<statesType>([])
const rightStates = reactive<statesType>([])
const leftRegist = function (status: stateType) {
  const sym = Symbol()
  leftStates.push([reactive(status), Symbol()])
  return sym
}
const rightRegist = function (status: stateType) {
  const sym = Symbol()
  rightStates.push([reactive(status), Symbol()])
  return sym
}
defineExpose({ leftRegist, rightRegist })
</script>

<style scoped>
.status-bar {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20px;
  background-color: #f0f0f0;
  padding: 0 10px;
}

.left-status,
.right-status {
  font-size: 14px;
  /* padding: 5px 10px; */
  cursor: pointer;
}
</style>
