import Queue from 'queue'
export function make_queue<T extends { queue: Queue }>(obj: T) {
  return new Proxy(obj, {
    get: function (o: T, props) {
      if (props === 'queue') {
        return o[props]
      }
      if (typeof o[props] === 'function') {
        return (...args) => {
          return new Promise((resolv) => {
            o.queue.push(async () => {
              resolv(await Promise.resolve(o[props](...args)))
            })
          })
        }
      }
      return o[props]
    }
  })
}
