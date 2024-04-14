const createDebounce = <T extends (...args) => void>(callback: T, delay: number) => {
  let timeout: number | undefined
  return (...args) => {
    if (timeout !== undefined) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      timeout = undefined
      callback(...args)
    }, delay)
  }
}
export default createDebounce
