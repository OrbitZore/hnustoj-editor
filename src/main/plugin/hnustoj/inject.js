'use strict'
const electron = require('electron')
const xpaths = {
  userid: "//label[contains(text(),'用户名')]/following::div",
  username: "//label[contains(text(),'昵称')]//following::input",
  problemtags: "//*[contains(@class,'label label-default')]",
  table: '//table',
  contestStartTime: "//label[contains(text(),'Start Time')]/following::*"
}
const xpathsearch = (key, scope = document) => {
  return document.evaluate(
    xpaths[key] || key,
    scope,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  )?.singleNodeValue
}
const xpathsearchall = (key, scope = document) => {
  const ret = []
  const selected = document.evaluate(
    xpaths[key] || key,
    scope,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  )
  for (let i = 0; i < selected.snapshotLength; i++) {
    ret.push(selected.snapshotItem(i))
  }
  return ret
}
const getTable = (tableNode) => {
  const head = xpathsearchall('//thead/tr/td', tableNode).map((node) => node.innerText)
  const body = xpathsearchall('//tbody/tr', tableNode).map((tr) => {
    return xpathsearchall('td', tr).map((td) => td.innerText)
  })
  return { head, body }
}
// Custom APIs for renderer
const api = {
  sendAccount() {
    const username = document.forms?.login?.user_id.value
    const password = document.forms?.login?.password.value
    electron.ipcRenderer.send(
      'hnustoj:sendAccount',
      username && password ? { username, password } : null
    )
  },
  regSendAccount() {
    document.forms['login']['user_id'].addEventListener('input', api.sendAccount)
    document.forms['login']['password'].addEventListener('input', api.sendAccount)
  },
  sendUser() {
    const userid = xpathsearch('userid')?.innerText
    const username = xpathsearch('username')?.value
    electron.ipcRenderer.send(
      'hnustoj:sendUser',
      userid && username
        ? {
            userid,
            username,
            extra: {}
          }
        : null
    )
  },
  sendProblemTags() {
    electron.ipcRenderer.send(
      'hnustoj:sendProblemTags',
      xpathsearchall('problemtags').map((node) => node.innerText)
    )
  },
  sendContestList() {
    const table = xpathsearch('table')
    console.log(table)
    const { body } = getTable(table)
    console.log(body)
    const ret = body.map((row) => ({
      id: row[0],
      name: row[1]
    }))
    console.log(ret)
    electron.ipcRenderer.send('hnustoj:sendContestList', ret)
  },
  sendContestInfo(contestid) {
    const problemTable = document.getElementById('problemset')
    const { body } = getTable(problemTable)
    const contestName = document.querySelector('center > * > *').innerText.match(/.* - (.*)/)[1]
    const [begin, end] = document
      .querySelector('center > *')
      .innerText.matchAll(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/g)
      .map((m) => m[0])
      .map(Date)
    const ret = {
      contestid,
      contestName,
      contestDuration: {
        begin,
        end
      },
      problems: body.map((row, index) => ({
        problemid: row[1].match(/\d+/)[0],
        problemName: row[2],
        creator: row[3],
        contestInfo: {
          contestid: contestid,
          contestProblemid: index,
          ac: +row[4],
          submit: +row[5]
        }
      }))
    }
    electron.ipcRenderer.send('hnustoj:sendContestInfo', ret)
  }
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}
