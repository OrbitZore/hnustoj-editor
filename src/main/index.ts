import log from 'electron-log/main.js'
log.initialize()
import './menu'
import './plugin'
import './lspclient'
import './app'
import * as lib from '../lib/lib'
export default lib
