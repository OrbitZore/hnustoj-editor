<template>
  <div class="status" @click="handleClick">
    {{ text }}
  </div>
</template>

<script lang="ts">
import { statusBarElementProps } from './StatusBarElementType'

export default {
  name: 'StatusBar',
  props: statusBarElementProps,
  emits: ['click'],
  setup(_props, { emit }) {
    const handleClick = () => {
      emit('click')
    }
    return {
      handleClick
    }
  },
  mounted() {
    console.log('regist', {
      text: this.text,
      click: this.handleClick
    })
  }
}
</script>

<style scoped>
.status {
  font-size: 14px;
  display: inline;
  /* padding: 5px 10px; */
  cursor: pointer;
  user-select: none;
}
.status:hover {
  background-color: #007bff;
}
</style>
