import { Sequelize, DataTypes } from 'sequelize'
import { appDataPath } from '@lib/setting'
import { encrypt, decript } from '@lib/hash'
import log from 'electron-log/main.js'
// import * as path from 'path'
const seqPath = appDataPath + '/database.sqlite'
const storageLog = log.scope('storage')
storageLog.log('storage at:', seqPath)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: appDataPath + '/database.sqlite'
  // storage: path.join(__dirname, '/database.sqlite')
})
const localstorageDB = sequelize.define('localstorage', {
  key: {
    primaryKey: true,
    type: DataTypes.STRING
  },
  value: DataTypes.TEXT
})

localstorageDB.sync()

export const localStorage = {
  setItem: async (key: string, value: string) => {
    storageLog.log('set: ', key, value)
    await localstorageDB.upsert({ key, value })
  },
  getItem: async (key: string) => {
    const item = await localstorageDB.findByPk(key)
    storageLog.log('get: ', key, item)
    return item ? item.dataValues.value : null
  },
  safeSetItem: async (key: string, value: string) => {
    await localstorageDB.upsert({ key, value: encrypt(value) })
  },
  safeGetItem: async (key: string) => {
    const item = await localstorageDB.findByPk(key)
    return item ? decript(item.dataValues.value) : ''
  },
  removeItem: async (key: string) => {
    await localstorageDB.destroy({ where: { key } })
  }
}
