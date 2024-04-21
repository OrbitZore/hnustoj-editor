import * as lsp from 'vscode-languageserver-protocol/node.js'
import * as child_process from 'child_process'
export default function StdioLS(processpath: string, args?: string[]) {
  const _process = child_process.spawn(processpath, args || [], {
    stdio: ['pipe', 'pipe', process.stderr]
  })
  return lsp.createProtocolConnection(
    new lsp.StreamMessageReader(_process.stdout),
    new lsp.StreamMessageWriter(_process.stdin)
  )
}
