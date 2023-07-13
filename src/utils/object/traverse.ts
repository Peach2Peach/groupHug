export const traverse = (obj: Record<string, any>, path: string) => {
  const keys = path.split('.')
  let val = obj
  while (keys.length && val) {
    const key = keys.shift()
    val = val[key] ? val[key] : null
  }
  return val
}
