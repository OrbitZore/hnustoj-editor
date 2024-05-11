import * as fse from 'fs-extra'
import * as path from 'path'
import json5 from 'json5'
import * as electron from 'electron'
import appconfDefault from './default.json?commonjs-external&asset'
const appconfPath = path.join(electron.app.getPath('appData'), 'config.json')
if (!fse.existsSync(appconfPath)) {
  fse.writeFileSync(appconfPath, fse.readFileSync(appconfDefault))
}
export const appconf = Object.assign(
  json5.parse(fse.readFileSync(appconfDefault, 'utf-8')),
  json5.parse(fse.readFileSync(appconfPath, 'utf-8'))
)
export const appDataPath = electron.app.getPath('appData')
