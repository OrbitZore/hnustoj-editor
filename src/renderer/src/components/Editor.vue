<template>
  <div ref="codeEditBox" class="codeEditBox codeEditBox1" />
</template>
<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, watch, inject } from 'vue'
import * as monaco from 'monaco-editor'
import * as appkey from '../AppKey'
import { editorProps } from './EditorType'
import createDebounce from '@renderer/utils/debounce'
import * as lsp from 'vscode-languageserver-protocol'
import { IpcRendererEvent } from 'electron/renderer'
import Queue from 'queue'
const props = defineProps(editorProps)
const emit = defineEmits(['change', 'editor-mounted'])
const codeEditBox = ref<HTMLInputElement | null>()

const editorInitText = inject(appkey.editorInitText)
const position = inject(appkey.editorPositon)
let editor: monaco.editor.IStandaloneCodeEditor

onMounted(async () => {
  if (!codeEditBox.value) {
    return
  }
  editor = monaco.editor.create(codeEditBox.value, {
    value: editorInitText?.value,
    language: props.language,
    readOnly: props.readOnly,
    theme: props.theme,
    tabSize: 2,
    ...props.options
  })
  const initResult = await window.api.lsp.reload('cpp', editorInitText?.value || '')
  const changeQueue = new Queue({ concurrency: 1, autostart: true })
  editor.onDidChangeModelContent((event: monaco.editor.IModelContentChangedEvent) =>
    changeQueue.push(() => window.api.lsp.change(event))
  )
  monaco.languages.registerCompletionItemProvider('cpp', {
    triggerCharacters: initResult.capabilities.completionProvider?.triggerCharacters,
    provideCompletionItems: async function (
      model: monaco.editor.ITextModel,
      position: monaco.Position,
      context: monaco.languages.CompletionContext
    ) {
      return window.api.lsp.requestCompletion(
        model.getVersionId(),
        position,
        context.triggerKind,
        context.triggerCharacter || model.getWordUntilPosition(position).word
      )
    }
  })
  window.electron.ipcRenderer.on(
    'PublishDiagnostics',
    (_event: IpcRendererEvent, diagnostics: lsp.Diagnostic[]) => {
      const model = editor.getModel()
      const c = diagnostics.map((diagnostic: lsp.Diagnostic): monaco.editor.IMarkerData => {
        diagnostic.range
        return {
          severity: 1 << (4 - (diagnostic.severity || 4)),
          message: diagnostic.message,
          startLineNumber: diagnostic.range.start.line + 1,
          startColumn: diagnostic.range.start.character + 1,
          endLineNumber: diagnostic.range.end.line + 1,
          endColumn: diagnostic.range.end.character + 1
        }
      })
      if (model) {
        monaco.editor.setModelMarkers(model, 'clangd', c)
      }
    }
  )
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
