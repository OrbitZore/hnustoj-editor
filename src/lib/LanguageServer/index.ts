import * as lsp from 'vscode-languageserver-protocol'
import StdioLS from './ls/StdioLS'
import { editor } from 'monaco-editor'
import path from 'path'

export interface LanguageClient extends lsp.ProtocolConnection {
  uri: string
  versionId: number
  initialize(): Promise<lsp.InitializeResult<unknown>>
  open(languageId: string, text: string): Promise<void>
  initialized(): Promise<void>
  didChange(text: string): Promise<void>
}

export function createLanguageClient(
  connection: lsp.ProtocolConnection,
  filePath: string,
  publishDiagnosticsHandler?: (publishDiagnostics: lsp.PublishDiagnosticsParams) => void
): LanguageClient {
  return {
    ...connection,
    uri: 'file://' + filePath,
    versionId: 1,
    initialize() {
      publishDiagnosticsHandler &&
        connection.onNotification(
          lsp.PublishDiagnosticsNotification.type,
          publishDiagnosticsHandler
        )
      const rootUri = 'file://' + path.basename(filePath)
      return connection.sendRequest(lsp.InitializeRequest.type, {
        capabilities: {
          offsetEncoding: ['utf-8'],
          textDocument: {
            codeAction: {
              codeActionLiteralSupport: true
            },
            completion: {
              completionItem: {
                deprecatedSupport: true,
                snippetSupport: true
              },
              completionItemKind: {
                valueSet: [
                  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
                  23, 24, 25
                ]
              },
              editsNearCursor: true
            },
            documentSymbol: {
              hierarchicalDocumentSymbolSupport: true
            },
            hover: {
              contentFormat: ['plaintext']
            },
            publishDiagnostics: {
              categorySupport: true,
              codeActionsInline: true,
              relatedInformation: true
            },
            signatureHelp: {
              signatureInformation: {
                parameterInformation: {
                  labelOffsetSupport: true
                }
              }
            }
          },
          workspace: {
            applyEdit: false,
            symbol: {
              symbolKind: {
                valueSet: [
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
                  24, 25, 26
                ]
              }
            },
            workspaceEdit: {
              documentChanges: true
            }
          }
        },
        initializationOptions: {
          clangdFileStatus: false,
          compilationDatabasePath: null,
          configSettings: {
            compilationDatabaseChanges: {}
          },
          fallbackFlags: []
        },
        processId: null,
        rootPath: null,
        rootUri
      })
    },
    initialized() {
      return connection.sendNotification(lsp.InitializedNotification.type, {})
    },
    open(languageId: string, text: string) {
      return connection.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: this.uri,
          languageId: languageId,
          version: 1,
          text
        }
      })
    },
    didChange(text: string) {
      return connection.sendNotification(lsp.DidChangeTextDocumentNotification.type, {
        textDocument: {
          uri: this.uri,
          version: this.versionId++
        },
        contentChanges: [
          {
            text
          }
        ]
      })
    }
  }
}

type Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never

export function clangdLanguageServer(...args: Tail<Parameters<typeof createLanguageClient>>) {
  const a = StdioLS('clangd', ['--background-index'])
  return createLanguageClient(a, ...args)
}
