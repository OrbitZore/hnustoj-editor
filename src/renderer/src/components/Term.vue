<template>
  <div v-show="show" class="term">
    <div ref="xtermElement" class="xterm" />
  </div>
</template>

<script async setup lang="ts">
import '@xterm/xterm/css/xterm.css'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { onMounted, ref, onBeforeUnmount, watch, nextTick } from 'vue'
import { IpcRendererEvent } from 'electron'
const term = new Terminal({
  convertEol: true, //启用时，光标将设置为下一行的开头
  // scrollback: 50, //终端中的回滚量
  disableStdin: false, //是否应禁用输入
  windowsMode: true, // 根据窗口换行
  // cursorStyle: "underline", //光标样式
  cursorBlink: true, //光标闪烁
  fontFamily: 'Hack',
  theme: {
    foreground: '#fcfcfc', // 前景
    background: '#232627', //背景色
    cursor: 'help' //设置光标
  }
})
const fitAddon = new FitAddon()
const shellid = ref(0)
const xtermElement = ref<HTMLElement | null>(null)
const resize = () => {
  nextTick(() => {
    fitAddon.fit()
    window.api.term.resize(shellid.value, term.cols, term.rows)
  })
}
const showTerm = () => {
  term.focus()
}
const props = defineProps({
  show: Boolean
})
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      nextTick(resize)
      nextTick(showTerm)
    }
  }
)
defineExpose({ resize })
onMounted(async () => {
  const shellid_ = await window.api.term.open()
  shellid.value = shellid_
  window.electron.ipcRenderer.on(
    'term.data',
    (_event: IpcRendererEvent, id: number, data: string) => {
      if (id !== shellid_) return
      term.write(data)
    }
  )
  // initSocket();
  term.loadAddon(fitAddon)
  term.open(xtermElement.value!)
  // 自适应大小(使终端的尺寸和几何尺寸适合于终端容器的尺寸)，初始化的时候宽高都是对的
  resize()
  term.focus()
  //监视命令行输入
  term.onData((data) => {
    window.api.term.stdin(shellid_, data)
  })
  window.addEventListener('resize', resize)
})
onBeforeUnmount(async () => {
  await window.api.term.close(shellid.value)
  window.removeEventListener('resize', resize)
})
</script>
<style scoped>
.term {
  width: 50vw;
  height: calc(100vh - 20px);
  background-color: #232627;
}
.xterm {
  height: 100%;
}
</style>
