import { traverse } from '../object'

/**
 * @description Method to filter array for unique values
 * @example ['a', 'a', 'c'].filter(unique())
 * [{a: 1}, {a: 1}, {c: 2}].filter(unique('a'))
 */
export const unique = (key?: string) => {
  if (key) {
    return (obj: any, index: number, self: any[]) =>
      self.findIndex((s) => traverse(s, key) === traverse(obj, key)) === index
  }
  return (obj: any, index: number, self: any[]) => self.findIndex((s) => s === obj) === index
}
