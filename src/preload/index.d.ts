import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      rpcCall: (channel: 'C++' | 'Python' | 'Java', method: string, obj: object) => object
    }
  }
}
