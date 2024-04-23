import { Psbt, Transaction, networks } from "bitcoinjs-lib";
import chai, { expect } from "chai";
import Sinon, { SinonStub } from "sinon";
import sinonChai from "sinon-chai";
import * as constants from "../../constants";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import * as getFeeEstimates from "../../src/utils/electrs/getFeeEstimates";
import * as postTx from "../../src/utils/electrs/postTx";
import { getTxIdOfInput } from "../../src/utils/psbt";
import { addPSBTToQueueWithClient } from "../../src/utils/queue";
import * as getExtraPSBTData from "../../src/utils/queue/getExtraPSBTData";
import { getError, getResult } from "../../src/utils/result";
import { feeEstimates } from "../../test/data/electrsData";
import { batchQueue } from "../../test/data/psbtData";
import * as batchBucket from "./batchBucket";
import { batchTransactions } from "./batchTransactions";
import * as getUTXOForInput from "./helpers/getUTXOForInput";
import * as hasBucketReachedTimeThreshold from "./helpers/hasBucketReachedTimeThreshold";

chai.use(sinonChai);

describe("batchTransactions", () => {
  let postTxStub: SinonStub;
  let batchBucketStub: SinonStub;
  const psbts = batchQueue.map(({ feeRate, psbt }) => ({
    feeRate,
    psbt: Psbt.fromBase64(psbt, { network: networks.regtest }),
  }));

  beforeEach(async () => {
    batchBucketStub = Sinon.stub(batchBucket, "batchBucket").callThrough();
    postTxStub = Sinon.stub(postTx, "postTx").callsFake((hex) =>
      Promise.resolve(getResult(Transaction.fromHex(hex).getId())),
    );
    Sinon.stub(getUTXOForInput, "getUTXOForInput").callsFake((input) => {
      const txId = getTxIdOfInput(input);
      return Promise.resolve([
        {
          txid: txId,
          vout: input.index,
          value: 100000000,
          status: {
            confirmed: true,
            block_height: 1,
            block_hash: "",
            block_time: 0,
          },
        },
      ]);
    });
    Sinon.stub(getExtraPSBTData, "getExtraPSBTData").resolves({
      index: 1,
      psbt: "",
      revocationToken: "",
      txId: "",
    });
    await db.transaction(async (client) => {
      await Promise.all(
        psbts.map(({ psbt, feeRate }) =>
          addPSBTToQueueWithClient(client, psbt, feeRate),
        ),
      );
    });
  });
  after(() => {
    Sinon.restore();
  });
  it("abort if fees estimates cannot be fetched", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getError({ error: "INTERNAL_SERVER_ERROR" }),
    );
    expect(await batchTransactions()).to.be.false;
  });
  it("handles post tx errors", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates),
    );
    postTxStub.resolves(getError({ error: "INTERNAL_SERVER_ERROR" }));
    expect(await batchTransactions()).to.be.false;
  });
  it("handles batchBucket errors", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates),
    );
    batchBucketStub.resolves(getError("No psbts left to spend"));
    expect(await batchTransactions()).to.be.false;
  });
  it("does not batch if the time and size threshold have not been reached", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates),
    );
    Sinon.stub(
      hasBucketReachedTimeThreshold,
      "hasBucketReachedTimeThreshold",
    ).resolves(false);
    Sinon.stub(constants, "BATCH_SIZE_THRESHOLD").value(Infinity);
    expect(await batchTransactions()).to.be.true;
    expect(batchBucketStub).to.have.not.been.called;
  });
  it("calls batch bucket with correct psbts, post transactions and return true on success", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates),
    );
    expect(await hasBucketReachedTimeThreshold.hasBucketReachedTimeThreshold())
      .to.be.true;
    expect(await batchTransactions()).to.be.true;

    expect(batchBucketStub).to.have.been.calledWith(psbts);

    const pending = await db.smembers(KEYS.TRANSACTION.PENDING);
    expect(pending.sort()).to.deep.equal([
      "6ea2eb2768480200afa64aaa11b5863eaa7335686df690a5991958d4976e0b3e",
    ]);

    expect(await hasBucketReachedTimeThreshold.hasBucketReachedTimeThreshold())
      .to.be.false;
  });
});
