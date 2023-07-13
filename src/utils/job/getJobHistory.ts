import { db } from '../db'
import { KEYS } from '../db/keys'
import { deserializeJobEvent } from './deserializeJobEvent'

export const getJobHistory = async (jobId: string): Promise<JobEvent[]> => {
  const jobHistory = await db.zrange(KEYS.JOB.PREFIX + jobId)

  return jobHistory.map(deserializeJobEvent).reverse()
}
