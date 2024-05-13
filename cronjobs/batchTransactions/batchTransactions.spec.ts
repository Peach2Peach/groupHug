import { networks, Psbt, Transaction } from "bitcoinjs-lib";
import chai, { expect } from "chai";
import Sinon, { SinonStub } from "sinon";
import sinonChai from "sinon-chai";
import * as constants from "../../constants";
import { sha256 } from "../../src/utils/crypto";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import * as getFeeEstimates from "../../src/utils/electrs/getFeeEstimates";
import * as getTx from "../../src/utils/electrs/getTx";
import * as getUTXO from "../../src/utils/electrs/getUTXO";
import * as postTx from "../../src/utils/electrs/postTx";
import { getError, getResult } from "../../src/utils/result";
import blockExplorerData from "../../test/data/blockExplorerData.json";
import { feeEstimates } from "../../test/data/electrsData";
import { batchQueue } from "../../test/data/psbtData";
import * as batchBucket from "./batchBucket";
import { batchTransactions } from "./batchTransactions";

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
    Sinon.stub(getTx, "getTx").callsFake((txid) =>
      Promise.resolve({ result: { ...blockExplorerData.tx, txid } }),
    );
    Sinon.stub(getUTXO, "getUTXO").callsFake(() =>
      Promise.resolve(
        getResult(
          blockExplorerData.utxo.map((utxo) => ({
            ...utxo,
            txid: "379a0e107a8fdfe49f1c3286d8ab2e62506cac4864d5f6ae40a393896f3540da",
          })),
        ),
      ),
    );
    await Promise.all(
      psbts.map(({ psbt }) =>
        db.client.hSet(KEYS.PSBT.PREFIX + sha256(psbt.toBase64()), {
          psbt: psbt.toBase64(),
          revocationToken: "",
          txId: "",
          index: 1,
        }),
      ),
    );
    await db.transaction(async (client) => {
      await Promise.all(
        psbts.map(({ psbt }) => client.sadd(KEYS.PSBT.QUEUE, psbt.toBase64())),
      );
    });
  });
  after(() => {
    Sinon.restore();
  });
  it("abort if fees estimates cannot be fetched", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves({
      error: "INTERNAL_SERVER_ERROR",
    });
    expect(await batchTransactions()).to.be.false;
  });
  it("handles post tx errors", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves({
      result: { ...feeEstimates, halfHourFee: 1 },
    });
    postTxStub.resolves(getError({ error: "INTERNAL_SERVER_ERROR" }));
    expect(await batchTransactions()).to.be.false;
  });
  it("handles batchBucket errors", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves({
      result: feeEstimates,
    });
    batchBucketStub.resolves(getError("No psbts left to spend"));
    expect(await batchTransactions()).to.be.false;
  });
  it("does not batch if the time threshold has not been reached", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves({
      result: feeEstimates,
    });
    await db.transaction(async (client) => {
      await client.set(KEYS.BUCKET.EXPIRATION, "true", constants.MSINS);
      await client.set(KEYS.BUCKET.TIME_THRESHOLD, "true", constants.MSINS);
    });
    Sinon.stub(constants, "BATCH_SIZE_THRESHOLD").value(Infinity);
    expect(await batchTransactions()).to.be.true;
    expect(batchBucketStub).to.have.not.been.called;
  });
  it("calls batch bucket with correct psbts, post transactions and return true on success", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves({
      result: { ...feeEstimates, halfHourFee: 1 },
    });
    expect(await db.exists(KEYS.BUCKET.EXPIRATION)).to.be.false;
    const queuedTransactions = await db.smembers(KEYS.PSBT.QUEUE);
    expect(await batchTransactions()).to.be.true;
    expect(batchBucketStub).to.have.been.calledWithMatch(queuedTransactions, 1);

    expect(await db.exists(KEYS.BUCKET.EXPIRATION)).to.be.true;
  });
  it("increases the fee index after batching", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves({
      result: { ...feeEstimates, halfHourFee: 1 },
    });
    expect(await db.exists(KEYS.FEE.INDEX)).to.be.false;
    expect(await batchTransactions()).to.be.true;
    expect(await db.get(KEYS.FEE.INDEX)).to.equal("1");
  });
});
