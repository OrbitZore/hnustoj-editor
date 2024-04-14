import { ElectronAPI } from '@electron-toolkit/preload'
import { RendererLogger } from 'electron-log'
interface api {
  rpcCall: (channel: 'C++' | 'Python' | 'Java', method: string, obj: object) => object
  lsp: {
    change: (text: string) => void
    reload: (languageId: string, text: string) => Promise<void>
  }
}
declare global {
  interface Window {
    electron: ElectronAPI
    api: api
    log: RendererLogger
  }
}
