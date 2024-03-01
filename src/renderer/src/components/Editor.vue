<template>
  <div ref="codeEditorWrapper" class="codeEditorWrapper">
    <div ref="codeEditBox" class="codeEditBox codeEditBox1" />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, watch, inject } from 'vue'
import * as monaco from 'monaco-editor'
import * as appkey from '../AppKey'
// import { languages as cppLanguage } from 'monaco-editor/esm/vs/basic-languages/cpp/cpp'
import { editorProps } from './EditorType'
const props = defineProps(editorProps)
const emit = defineEmits(['change', 'editor-mounted', 'update:position'])
const codeEditBox = ref<HTMLInputElement | null>()
const codeEditorWrapper = ref<HTMLInputElement | null>()

const editorInitText = inject(appkey.editorInitText)
const position = inject(appkey.editorPositon)
let editor: monaco.editor.IStandaloneCodeEditor

onMounted(() => {
  if (!codeEditBox.value) {
    return
  }
  editor = monaco.editor.create(codeEditBox.value, {
    value: editorInitText,
    language: props.language,
    readOnly: props.readOnly,
    theme: props.theme,
    ...props.options
  })
  editor.onDidChangeCursorPosition((e) => {
    if (position) {
      position.lineNumber = e.position.lineNumber
      position.column = e.position.column
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
</script>
<style lang="css" scoped>
.codeEditBox,
.codeEditorWrapper {
  width: 50vw;
  height: calc(100vh - 20px);
}
.monaco-editor {
}
</style>
