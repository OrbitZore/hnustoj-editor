<template>
  <div ref="codeEditorWrapper" class="codeEditorWrapper">
    <div ref="codeEditBox" class="codeEditBox" :class="hightChange && 'codeEditBox1'" />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as monaco from 'monaco-editor'
// import { languages as cppLanguage } from 'monaco-editor/esm/vs/basic-languages/cpp/cpp'
import { editorProps } from './EditorType'
const props = defineProps(editorProps)
const emit = defineEmits(['update:modelValue', 'change', 'editor-mounted'])
const codeEditBox = ref<HTMLInputElement | null>()
const codeEditorWrapper = ref<HTMLInputElement | null>()
let editor: monaco.editor.IStandaloneCodeEditor

onMounted(() => {
  if (!codeEditBox.value) {
    return
  }
  editor = monaco.editor.create(codeEditBox.value, {
    value: props.modelValue,
    language: props.language,
    readOnly: props.readOnly,
    theme: props.theme,
    ...props.options
  })

  editor.onDidChangeModelContent(() => {
    const value = editor.getValue() // 给父组件实时返回最新文本
    emit('update:modelValue', value)
    emit('change', value)
  })
  editor.onDidChangeCursorPosition((e) => {
    e.position.lineNumber
    e.position.column
  })
  watch(
    () => props.modelValue,
    (newValue) => {
      if (editor) {
        const value = editor.getValue()
        if (newValue !== value) {
          editor.setValue(newValue)
        }
      }
    }
  )
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
  height: 100%;
  width: auto;
}
.monaco-editor {
}
</style>
