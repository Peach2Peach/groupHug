import { db } from "../db";
import { KEYS } from "../db/keys";

export const getJobHistory = async (jobId: string): Promise<JobEvent[]> => {
  const jobHistory = await db.client.zRangeByScore(
    KEYS.JOB.PREFIX + jobId,
    "-inf",
    "+inf",
  );

  return jobHistory
    .map((job) => {
      const [date, status, runningTime] = job.split("::");
      return {
        date: new Date(Number(date)),
        status: status as JobEvent["status"],
        runningTime: runningTime ? Number(runningTime) : undefined,
      };
    })
    .reverse();
};
