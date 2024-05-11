import log from 'electron-log/main.js'
log.initialize()
import './menu'
import './plugin'
import './lspclient'
import './onlinejudger'
import './term'
import './app'
import * as lib from '@lib'
export default lib
