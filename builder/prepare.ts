import * as stream from 'stream/promises'
import Axios from 'axios'
import { createWriteStream } from 'fs'
import path from 'path'
import crypto from 'crypto'

export async function downloadFile(
  fileUrl: string,
  checksum: string,
  hashMethod: string = 'sha256'
): Promise<string> {
  const location = path.join(__dirname, 'cache', checksum)
  const writer = createWriteStream(location)
  const hash = crypto.createHash(hashMethod)
  const res = await Axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream'
  })
  res.data.on('data', (chunk: crypto.BinaryLike) => hash.update(chunk))
  res.data.pipe(writer)
  await stream.finished(writer)
  const calculatedSum = hash.digest('hex')
  if (calculatedSum != checksum) {
    throw new Error('cheksum incorrect')
  }
  return location
}
