<template>
  <div class="status-bar">
    <div class="left-status">
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
        :text="rightState[0].text.value"
        @click="rightState[0].click"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { statusBarProps, stateType, statesType } from './StatusBarType'
import StatusBarElement from './StatusBarElement.vue'
const props = defineProps(statusBarProps)
  expose: ['leftRegist', 'rightRegist'],
  setup() {},
  data(): {
    leftStates: statesType
    rightStates: statesType
  } {
    return {
      leftStates: [],
      rightStates: []
    }
  },
  methods: {
    leftRegist(status: stateType) {
      console.log(status.text)
      this.leftStates.push([status, Symbol()])
    },
    rightRegist(status: stateType) {
      this.rightStates.push([status, Symbol()])
    }
  }
}
</script>

<style scoped>
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  background-color: #f0f0f0;
  padding: 0 10px;
}

.left-status,
.right-status {
  padding: 5px 10px;
  cursor: pointer;
}

.left-status.active,
.right-status.active {
  background-color: #007bff;
  color: #fff;
}
</style>
