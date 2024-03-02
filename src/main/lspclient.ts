import { spawn, ChildProcess } from 'child_process'
const header = 'Content-Length: '
const ms = 5000
export default class lspClient {
  process: ChildProcess
  id = 0
  waitmap = {}
  buffer = ''
  constructor(cmd: string, args: string[] = []) {
    console.log('LSP Client created:', cmd, args)
    this.process = spawn(cmd, args)
    this.process.on('error', (err) => {
      console.log('LSP Client error:', err)
      this.process.kill()
      this.id = 0
      this.waitmap = {}
      this.buffer = ''
      this.process = spawn(cmd, args)
    })
    this.process.stdout?.on('data', (data) => {
      this.buffer += data.toString()
      console.log('check' + this.buffer)
      //regex match
      const match = this.buffer.match(/^Content-Length: (\d+)\r\n\r\n/)
      if (match === null) {
        if (this.buffer.length > header.length) this.buffer = ''
        return
      }
      const len = parseInt(match[1])
      console.log('len' + len)
      if (this.buffer.length >= match.length + len) {
        const result = JSON.parse(this.buffer.slice(match[0].length, match[0].length + len))
        console.info(result)
        if ('id' in result && this.waitmap[result['id']] !== undefined) {
          this.waitmap[result['id']](result)
        }
        this.buffer = this.buffer.slice(match[0].length + len)
      }
    })
  }
  private async send(method: string, obj: object, id: number | undefined = undefined) {
    const json = JSON.stringify({
      jsonrpc: '2.0',
      id,
      method,
      params: obj
    })
    console.info('send:', json)
    this.process.stdin?.write(header + json.length + '\r\n\r\n' + json, () => {
      console.log('write success')
    })
  }
  public async request(method: string, obj: object) {
    return await this.send(method, obj, ++this.id)
  }
  public async notification(method: string, obj: object) {
    return await this.send(method, obj)
  }
}
