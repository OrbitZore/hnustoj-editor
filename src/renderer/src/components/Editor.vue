<template>
  <div v-show="show" ref="codeEditBox" class="codeEditBox codeEditBox1" />
</template>
<script lang="ts" setup>
function uriToPath(uri: string) {
  return uri.slice(7)
}

import { onMounted, onBeforeUnmount, ref, watch, inject, nextTick, reactive } from 'vue'
import * as monaco from 'monaco-editor'
import * as appkey from '../AppKey'
import { editorProps } from './EditorType'
import * as lsp from 'vscode-languageserver-protocol'
import { IpcRendererEvent } from 'electron'
import Queue from 'queue'
const props = defineProps(editorProps)
const emit = defineEmits(['change', 'editor-mounted'])
const codeEditBox = ref<HTMLInputElement | null>()

const editorInitText = inject(appkey.editorInitText, ref(''))
const position = inject(
  appkey.editorPositon,
  reactive({
    lineNumber: 0,
    column: 0
  })
)
const editorpath = inject(appkey.editorPath, ref('/tmp/test.cpp'))
const editorlang = inject(appkey.editorLanguage, ref('cpp'))
let editor: monaco.editor.IStandaloneCodeEditor
const changeQueue = new Queue({ concurrency: 1, autostart: true })
let loadingcnt = 0
watch(
  () => props.show,
  (newv) => {
    if (newv) {
      nextTick(() => {
        editor.layout()
        editor.focus()
      })
    }
  }
)
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

  editor.onDidChangeModelContent(
    (event: monaco.editor.IModelContentChangedEvent) =>
      !loadingcnt &&
      changeQueue.push(() => editorpath && window.api.lsp.change(editorpath.value, event))
  )
  window.electron.ipcRenderer.on('menu:open', (_event: IpcRendererEvent, filename: string) => {
    console.log('opened', filename)
    if (editorpath) {
      editorpath.value = filename
    }
  })
  window.electron.ipcRenderer.on('menu:save', () => {
    console.log('saved')
    if (editorpath) {
      window.api.lsp.save(editorpath.value, editor.getValue())
    }
  })
  window.electron.ipcRenderer.on(
    'PublishDiagnostics',
    (_event: IpcRendererEvent, diagnostics: lsp.PublishDiagnosticsParams) => {
      if (uriToPath(diagnostics.uri) === editorpath?.value) {
        const model = editor.getModel()
        const c = diagnostics.diagnostics.map(
          (diagnostic: lsp.Diagnostic): monaco.editor.IMarkerData => {
            diagnostic.range
            return {
              severity: 1 << (4 - (diagnostic.severity || 4)),
              message: diagnostic.message,
              startLineNumber: diagnostic.range.start.line + 1,
              startColumn: diagnostic.range.start.character + 1,
              endLineNumber: diagnostic.range.end.line + 1,
              endColumn: diagnostic.range.end.character + 1
            }
          }
        )
        if (model) {
          monaco.editor.setModelMarkers(model, 'clangd', c)
        }
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
  // 语言变化时，重新设置语言
  watch(
    () => editorlang?.value,
    async (newlang) => {
      if (editor && newlang) {
        console.log('test', newlang)
        monaco.editor.setModelLanguage(editor.getModel()!, newlang)
        monaco.languages.registerCompletionItemProvider(newlang, {
          triggerCharacters: (await window.api.lsp.getInitializeResult(newlang)).capabilities
            .completionProvider?.triggerCharacters,
          provideCompletionItems: async function (
            model: monaco.editor.ITextModel,
            position: monaco.Position,
            context: monaco.languages.CompletionContext
          ) {
            return (
              editorpath &&
              window.api.lsp.requestCompletion(
                editorpath?.value,
                model.getVersionId(),
                position,
                context.triggerKind,
                context.triggerCharacter || model.getWordUntilPosition(position).word
              )
            )
          }
        })
      }
    },
    { immediate: true }
  )
  // 路径或语言变化时，重新打开文件
  watch(
    () => [editorpath?.value, editorlang?.value],
    async (new_, old) => {
      loadingcnt++
      if (old && old[0]) {
        await window.api.lsp.close(old[0])
      }
      if (editor && new_[0] && new_[1]) {
        editor.setValue(await window.api.lsp.open(new_[0], new_[1]))
      }
      loadingcnt--
    },
    { immediate: true }
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
