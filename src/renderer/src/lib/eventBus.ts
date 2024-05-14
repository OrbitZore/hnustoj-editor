import mitt from 'mitt'
export type Events = {
  //视图
  hideSidebar: void
  showSidebar: void
  showSiderbarComponent: string
  toTerminal: string
  toEditor: string
  ojChanged: void
  //操作
  openProblem: string
  openContest: string
  runtest: void
}
const eventBus = mitt<Events>()
export type EventBus = typeof eventBus
window.electron.ipcRenderer.on('eventBus', (e, eventName, args) => {
  eventBus.emit(eventName, args)
})
export default eventBus
