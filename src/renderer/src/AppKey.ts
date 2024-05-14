import { InjectionKey, Ref } from 'vue'
import type { EventBus } from '@lib/eventBus'
export const editorInitText = Symbol() as InjectionKey<Ref<string>>
export const editorPositon = Symbol() as InjectionKey<{
  lineNumber: number
  column: number
}>
export const editorLanguage = Symbol() as InjectionKey<Ref<string>>
export const editorPath = Symbol() as InjectionKey<Ref<string>>
export const onlineJudgerKey = Symbol() as InjectionKey<Ref<string | null>>
export const eventBusKey = Symbol() as InjectionKey<Ref<EventBus>>
