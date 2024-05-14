/* eslint-disable no-await-in-loop */
import { ok, strictEqual } from "assert";
import { describe, it } from "mocha";
import { sleep } from "../../../test/unit/helpers/sleep";
import { getJobHistory } from "./getJobHistory";
import { logJobExecution } from "./logJobExecution";

describe("logJobExecution", () => {
  it("logs the execution of a successful job run", async () => {
    await logJobExecution("job1", async () => {
      await sleep(1);
      return true;
    });
    const history = await getJobHistory("job1");
    strictEqual(history.length, 2);
    strictEqual(history[1].status, "RUNNING");
    strictEqual(history[0].status, "OK");
    ok(history[0].date instanceof Date);
    strictEqual(typeof history[0].runningTime, "number");
  });
  it("logs the execution of a failed job run", async () => {
    await logJobExecution("job1", async () => {
      await sleep(1);
      return false;
    });
    const history = await getJobHistory("job1");
    strictEqual(history.length, 2);
    strictEqual(history[1].status, "RUNNING");
    strictEqual(history[0].status, "ERROR");
    ok(history[0].date instanceof Date);
    strictEqual(typeof history[0].runningTime, "number");
  });
  it("logs the execution of a job run that throws an error", async () => {
    await logJobExecution("job1", async () => {
      await sleep(1);
      throw new Error("test");
    });
    const history = await getJobHistory("job1");
    strictEqual(history.length, 2);
    strictEqual(history[1].status, "RUNNING");
    strictEqual(history[0].status, "ERROR");
    ok(history[0].date instanceof Date);
    strictEqual(typeof history[0].runningTime, "number");
  });
  it("logs the running time of a job run", async () => {
    await logJobExecution("job1", async () => {
      await sleep(500);
      return true;
    });
    const history = await getJobHistory("job1");

    if (!history[0]?.runningTime) throw new Error("runningTime is not defined");
    // check approximate running time
    ok(history[0].runningTime >= 500);
    ok(history[0].runningTime < 750);
  });
  it("drops history items above max entries", async () => {
    const MAX_ENTRIES = 100;

    for (let i = MAX_ENTRIES + 2; i > 0; i--) {
      await logJobExecution("job1", () => false);
      await sleep(1);
    }
    const history = await getJobHistory("job1");
    strictEqual(history.length, MAX_ENTRIES);
  });
});
