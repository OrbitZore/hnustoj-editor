import { InjectionKey, Ref } from 'vue'

export const editorInitText = Symbol() as InjectionKey<Ref<string>>
export const editorPositon = Symbol() as InjectionKey<{
  lineNumber: number
  column: number
}>
export const editorLanguage = Symbol() as InjectionKey<Ref<string>>
export const editorPath = Symbol() as InjectionKey<Ref<string>>
