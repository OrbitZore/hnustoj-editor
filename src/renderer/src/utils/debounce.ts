const createDebounce = <
  T extends (...args) => void | Promise<void>,
  U extends () => void | Promise<void>
>(
  callback: T,
  icallback: U,
  delay: number
) => {
  let timeout: [number, Parameters<T>] | undefined
  return async (...args: Parameters<T>) => {
    if (timeout !== undefined) {
      clearTimeout(timeout[0])
      await callback(...timeout[1])
    }
    timeout = [
      setTimeout(async () => {
        await callback(...args)
        await icallback()
        timeout = undefined
      }, delay) as unknown as number,
      args
    ]
  }
}
export default createDebounce
