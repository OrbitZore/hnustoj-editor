import * as lsp from 'vscode-languageserver-protocol/node.js'
import { spawn } from '../../exec/index.js'
export default function StdioLS(processpath: string, args?: string[]) {
  const _process = spawn(processpath, args)
  return lsp.createProtocolConnection(
    new lsp.StreamMessageReader(_process.stdout!),
    new lsp.StreamMessageWriter(_process.stdin!)
  )
}
