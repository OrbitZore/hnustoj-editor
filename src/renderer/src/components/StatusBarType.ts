import { PropType, Ref } from 'vue'

export type stateType = {
  text: string
  click: () => void
}

export type statesType = [stateType, symbol][]

export const statusBarProps = {
  leftText: {
    type: String as PropType<string>,
    default: 'Left'
  },
  rightText: {
    type: String as PropType<string>,
    default: 'Right'
  }
}
