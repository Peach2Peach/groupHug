import { deepStrictEqual } from 'assert'
import { describe, it } from 'mocha'
import { deserializeJobEvent } from '.'

describe('deserializeJobEvent', () => {
  it('deserializes a job event', async () => {
    const runningEvent = '1666682883301::RUNNING::'
    const okEvent = '1666682883301::OK::5430'
    const errorEvent = '1666682883301::ERROR::5430'
    const deserializedRunningEvent = await deserializeJobEvent(runningEvent)
    const deserializedOkEvent = await deserializeJobEvent(okEvent)
    const deserializedErrorEvent = await deserializeJobEvent(errorEvent)

    deepStrictEqual(deserializedRunningEvent, {
      date: new Date(1666682883301),
      status: 'RUNNING',
      runningTime: undefined,
    })
    deepStrictEqual(deserializedOkEvent, {
      date: new Date(1666682883301),
      status: 'OK',
      runningTime: 5430,
    })
    deepStrictEqual(deserializedErrorEvent, {
      date: new Date(1666682883301),
      status: 'ERROR',
      runningTime: 5430,
    })
  })
})
