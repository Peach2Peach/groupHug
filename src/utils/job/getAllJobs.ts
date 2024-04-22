import { db } from "../db";
import { KEYS } from "../db/keys";

export const getAllJobs = async (): Promise<string[]> => {
  const jobs = await db.keys(KEYS.JOB.PREFIX + "*");

  return jobs.map((job) => job.replace(KEYS.JOB.PREFIX, ""));
};
