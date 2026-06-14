// Wrap any promise with a timeout
export function withTimeout(promise, ms = 10000, label = 'Operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms
      )
    )
  ])
}
