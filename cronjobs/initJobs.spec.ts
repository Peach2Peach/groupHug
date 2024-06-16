import chai, { expect } from "chai";
import cron from "node-cron";
import Sinon from "sinon";
import sinonChai from "sinon-chai";
import * as batchTransactions from "./batchTransactions/batchTransactions";
import { initJobs } from "./initJobs";

chai.use(sinonChai);
describe("initJobsStub", () => {
  const batchTransactionsStub = Sinon.stub(
    batchTransactions,
    "batchTransactions",
  );
  after(() => {
    Sinon.restore();
  });
  it("should init the batching job", () => {
    initJobs();
    cron.getTasks().forEach((task) => {
      task.start();
      task.on("taskStop", () => {
        expect(batchTransactionsStub).to.have.been.called;
      });
    });
    cron.getTasks().forEach((task) => {
      task.stop();
    });
  });
});
