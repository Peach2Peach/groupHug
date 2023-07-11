import { describe, it } from 'mocha'
import { ok } from 'assert'
import { sleep } from './sleep'

describe('sleep', () => {
  it('stop execution for a given time', async () => {
    const start = new Date()
    await sleep(50)

    const end = new Date()
    ok(start.getTime() + 40 < end.getTime())
    ok(start.getTime() + 80 > end.getTime())
  })
})
