import { IRange } from 'monaco-editor'
import { Range } from 'vscode-languageserver-protocol'

export function IRangeToRange(range: IRange) {
  return Range.create(
    range.startLineNumber,
    range.startColumn,
    range.endLineNumber,
    range.endColumn
  )
}
