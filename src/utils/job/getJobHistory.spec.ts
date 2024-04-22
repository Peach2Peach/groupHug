import { ok, strictEqual } from "assert";
import { describe, it } from "mocha";
import { getJobHistory, logJobExecution } from ".";
import { sleep } from "../../../test/unit/helpers/sleep";

describe("getJobHistory", () => {
  it("gets the execution history of a job", async () => {
    await logJobExecution("job1", async () => {
      await sleep(1);
      return true;
    });
    await sleep(1);
    await logJobExecution("job1", async () => {
      await sleep(1);
      return true;
    });
    await sleep(1);
    await logJobExecution("job1", async () => {
      await sleep(1);
      return false;
    });
    const jobHistory = await getJobHistory("job1");
    ok(jobHistory.length === 6);
    strictEqual(jobHistory[0].status, "ERROR");
    ok(jobHistory[0].date instanceof Date);
    strictEqual(typeof jobHistory[0].runningTime, "number");

    strictEqual(jobHistory[1].status, "RUNNING");
    strictEqual(jobHistory[2].status, "OK");
    strictEqual(jobHistory[3].status, "RUNNING");
    strictEqual(jobHistory[4].status, "OK");
    strictEqual(jobHistory[5].status, "RUNNING");
  });

  it("returns an empty error for non existing history", async () => {
    const jobHistory = await getJobHistory("job2");
    ok(jobHistory.length === 0);
  });
});
