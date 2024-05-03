import * as lsp from 'vscode-languageserver-protocol'
import type * as monaco from 'monaco-editor'
import type { LanguageClient } from '..'

const LSPCompletionItemKindToMonaco = {
  1: 18, // const Text: 1;
  2: 0, // const Method: 2;
  3: 1, // const Function: 3;
  4: 2, // const Constructor: 4;
  5: 3, // const Field: 5;
  6: 4, // const Variable: 6;
  7: 5, // const Class: 7;
  8: 7, // const Interface: 8;
  9: 8, // const Module: 9;
  10: 9, // const Property: 10;
  11: 12, // const Unit: 11;
  12: 13, // const Value: 12;
  13: 15, // const Enum: 13;
  14: 17, // const Keyword: 14;
  15: 7,
  16: 19, // const Color: 16;
  17: 20, // const File: 17;
  18: 21, // const Reference: 18;
  19: 23, // const Folder: 19;
  20: 16, // const EnumMember: 20;
  21: 14, // const Constant: 21;
  22: 6, // const Struct: 22;
  23: 10, // const Event: 23;
  24: 11, // const Operator: 24;
  25: 24 // const TypeParameter: 25;
}
const LSPRangeToMonaco = (range: lsp.Range): monaco.IRange => {
  return {
    startLineNumber: range.start.line + 1,
    startColumn: range.start.character + 1,
    endLineNumber: range.end.line + 1,
    endColumn: range.end.character + 1
  }
}
export function createLanguageClient(connection: lsp.ProtocolConnection): LanguageClient {
  return {
    ...connection,
    initialize() {
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
                snippetSupport: true,
                insertReplaceSupport: true
              },
              completionItemKind: {
                valueSet: [
                  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
                  23, 24, 25
                ]
              },
              contextSupport: true
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
        rootPath: null
      } as unknown as lsp.InitializeParams)
    },
    initialized() {
      return connection.sendNotification(lsp.InitializedNotification.type, {})
    },
    open(uri: string, languageId: string, text: string) {
      return connection.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri,
          languageId: languageId,
          version: 1,
          text
        }
      })
    },
    close(uri: string) {
      return connection.sendNotification(lsp.DidCloseTextDocumentNotification.type, {
        textDocument: {
          uri
        }
      })
    },
    didChange(uri: string, changeEvent: monaco.editor.IModelContentChangedEvent) {
      return connection.sendNotification(lsp.DidChangeTextDocumentNotification.type, {
        textDocument: {
          uri,
          version: changeEvent.versionId
        },
        contentChanges: changeEvent.changes.map((change) => {
          return {
            range: lsp.Range.create(
              change.range.startLineNumber - 1,
              change.range.startColumn - 1,
              change.range.endLineNumber - 1,
              change.range.endColumn - 1
            ),
            text: change.text
          }
        })
      })
    },
    onPublishDiagnostics(
      publishDiagnosticsHandler: (publishDiagnostics: lsp.PublishDiagnosticsParams) => void
    ) {
      connection.onNotification(lsp.PublishDiagnosticsNotification.type, publishDiagnosticsHandler)
    },
    async requestCompletion(
      uri: string,
      versionId: number,
      position: monaco.Position,
      triggerKind: number,
      triggerCharacter: string
    ) {
      let result =
        (await connection.sendRequest(lsp.CompletionRequest.type, {
          textDocument: {
            uri,
            version: versionId
          },
          position: {
            line: position.lineNumber - 1,
            character: position.column - 1
          },
          context: {
            triggerKind: triggerKind + 1,
            triggerCharacter: triggerCharacter
          }
        } as lsp.CompletionParams)) || []
      if ('items' in result) {
        result = result.items
      }
      return {
        suggestions: result
          .sort((a: lsp.CompletionItem, b: lsp.CompletionItem) => {
            return b['score'] - a['score']
          })
          .filter((completionItem: lsp.CompletionItem) => {
            return completionItem.insertText?.startsWith(triggerCharacter)
          })
          .map((completionItem: lsp.CompletionItem) => {
            const textEdit = completionItem.textEdit as lsp.TextEdit
            return {
              label: completionItem.label,
              kind: LSPCompletionItemKindToMonaco[completionItem.kind || 0],
              documentation: completionItem.documentation,
              insertText: textEdit.newText,
              insertTextRules: 4,
              range: LSPRangeToMonaco(textEdit.range)
            }
          })
      } as monaco.languages.CompletionList
    }
  }
}
