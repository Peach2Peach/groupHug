/* eslint-disable no-await-in-loop */
import { ok, strictEqual } from "assert";
import { describe, it } from "mocha";
import Sinon from "sinon";
import { getJobHistory, logJobExecution } from ".";
import { sleep } from "../../../test/unit/helpers/sleep";
import * as constants from "./constants";

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
  it("logs the running time of a job run", async () => {
    await logJobExecution("job1", async () => {
      await sleep(500);
      return true;
    });
    const history = await getJobHistory("job1");

    // no running time for started jobs yet
    ok(!history[1].runningTime);
    ok(!history[1].runningTime);

    // check approximate running time
    ok(history[0].runningTime! >= 500);
    ok(history[0].runningTime! < 750);
  });
  it("drops history items above max entries", async () => {
    const MAX_ENTRIES = 10;
    Sinon.stub(constants, "MAX_ENTRIES").get(() => MAX_ENTRIES);

    for (let i = MAX_ENTRIES + 2; i > 0; i--) {
      await logJobExecution("job1", () => false);
      await sleep(1);
    }
    const history = await getJobHistory("job1");
    strictEqual(history.length, MAX_ENTRIES);
  });
});
