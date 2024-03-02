import { Ref } from 'vue'

export interface stateType {
  text: Ref<string> | string
  click: () => void
}

export type statesType = [stateType, symbol][]

export const statusBarProps = {
  leftText: {
    type: String,
    default: 'Left'
  },
  rightText: {
    type: String,
    default: 'Right'
  }
}
