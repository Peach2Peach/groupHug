import { ok } from 'assert'
import { describe, it } from 'mocha'
import { getAllJobs, logJobExecution } from '.'
import { sleep } from '../../../test/unit/helpers/sleep'

describe('getAllJobs', () => {
  it('gets all jobs that have run at least once', async () => {
    await logJobExecution('job1', () => true)
    await sleep(5)
    await logJobExecution('job2', () => true)
    await sleep(5)
    await logJobExecution('job3', () => true)
    await sleep(5)
    await logJobExecution('job1', () => true)
    const jobs = await getAllJobs()
    ok(jobs.includes('job1'))
    ok(jobs.includes('job2'))
    ok(jobs.includes('job3'))
    ok(!jobs.includes('job4'))
  })
})
