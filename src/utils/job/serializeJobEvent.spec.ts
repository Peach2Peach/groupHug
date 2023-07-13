import { deepStrictEqual } from 'assert'
import { describe, it } from 'mocha'
import { serializeJobEvent } from '.'

describe('serializeJobEvent', () => {
  it('serializes a job event', async () => {
    const runningEvent: JobEvent = {
      date: new Date(1666682883301),
      status: 'RUNNING',
    }
    const okEvent: JobEvent = {
      date: new Date(1666682883301),
      status: 'OK',
      runningTime: 5430,
    }
    const errorEvent: JobEvent = {
      date: new Date(1666682883301),
      status: 'ERROR',
      runningTime: 5430,
    }
    const serializedRunningEvent = await serializeJobEvent(runningEvent)
    const serializedOkEvent = await serializeJobEvent(okEvent)
    const serializedErrorEvent = await serializeJobEvent(errorEvent)

    deepStrictEqual(serializedRunningEvent, '1666682883301::RUNNING::undefined')
    deepStrictEqual(serializedOkEvent, '1666682883301::OK::5430')
    deepStrictEqual(serializedErrorEvent, '1666682883301::ERROR::5430')
  })
})
