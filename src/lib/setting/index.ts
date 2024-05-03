import * as fs from 'fs/promises'
import * as fse from 'fs-extra'
import path from 'path'
import json5 from 'json5'
import electron from 'electron'
import appconfDefault from './default.json?commonjs-external&asset'
import { AppConf } from './default'
const appconfPath = path.join(electron.app.getPath('appData'), 'config.json')
if (!fse.existsSync(appconfPath)) {
  fse.writeFileSync(appconfPath, fse.readFileSync(appconfDefault))
}
export const appconf = json5.parse(await fs.readFile(appconfPath, 'utf-8')) as AppConf
