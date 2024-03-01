import { InjectionKey } from 'vue'

export const editorInitText = Symbol() as InjectionKey<string>
export const editorPositon = Symbol() as InjectionKey<{
  lineNumber: number
  column: number
}>
