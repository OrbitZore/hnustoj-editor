<template>
  <div ref="codeEditBox" class="codeEditBox codeEditBox1" />
</template>
<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, watch, inject } from 'vue'
import * as monaco from 'monaco-editor'
import * as appkey from '../AppKey'
// import { languages as cppLanguage } from 'monaco-editor/esm/vs/basic-languages/cpp/cpp'
import { editorProps } from './EditorType'
const props = defineProps(editorProps)
const emit = defineEmits(['change', 'editor-mounted'])
const codeEditBox = ref<HTMLInputElement | null>()

const editorInitText = inject(appkey.editorInitText)
const position = inject(appkey.editorPositon)
let editor: monaco.editor.IStandaloneCodeEditor

onMounted(() => {
  if (!codeEditBox.value) {
    return
  }
  editor = monaco.editor.create(codeEditBox.value, {
    value: editorInitText?.value,
    language: props.language,
    readOnly: props.readOnly,
    theme: props.theme,
    ...props.options
  })
  editor.onDidChangeCursorPosition((e) => {
    if (position) {
      const { lineNumber, column } = e.position
      position.lineNumber = lineNumber
      position.column = column
    }
  })
  watch(
    () => props.options,
    (newValue) => {
      editor.updateOptions(newValue)
    },
    { deep: true }
  )
  watch(
    () => props.readOnly,
    () => {
      console.log('props.readOnly', props.readOnly)
      editor.updateOptions({ readOnly: props.readOnly })
    },
    { deep: true }
  )
  watch(
    () => props.language,
    (newValue) => {
      monaco.editor.setModelLanguage(editor.getModel()!, newValue)
    }
  )
  emit('editor-mounted', editor)
})

onBeforeUnmount(() => {
  editor.dispose()
})

const reset = () => {
  if (editorInitText?.value) {
    editor.setValue(editorInitText?.value)
  }
}

defineExpose({ reset })
</script>
<style lang="css" scoped>
.codeEditBox {
  width: 50vw;
  height: calc(100vh - 20px);
}
.monaco-editor {
}
</style>
