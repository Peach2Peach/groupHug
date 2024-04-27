import { networks, Psbt, Transaction } from "bitcoinjs-lib";
import chai, { expect } from "chai";
import Sinon, { SinonStub } from "sinon";
import sinonChai from "sinon-chai";
import * as constants from "../../constants";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import * as getFeeEstimates from "../../src/utils/electrs/getFeeEstimates";
import * as getTx from "../../src/utils/electrs/getTx";
import * as getUTXO from "../../src/utils/electrs/getUTXO";
import * as postTx from "../../src/utils/electrs/postTx";
import * as getExtraPSBTData from "../../src/utils/queue/getExtraPSBTData";
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
      Promise.resolve(getResult(Transaction.fromHex(hex).getId()))
    );
    Sinon.stub(getTx, "getTx").callsFake((txid) =>
      Promise.resolve(getResult({ ...blockExplorerData.tx, txid }))
    );
    Sinon.stub(getUTXO, "getUTXO").callsFake(() =>
      Promise.resolve(
        getResult(
          blockExplorerData.utxo.map((utxo) => ({
            ...utxo,
            txid: "379a0e107a8fdfe49f1c3286d8ab2e62506cac4864d5f6ae40a393896f3540da",
          }))
        )
      )
    );
    Sinon.stub(getExtraPSBTData, "getExtraPSBTData").resolves({
      index: 1,
      psbt: "",
      revocationToken: "",
      txId: "",
    });
    await db.transaction(async (client) => {
      await Promise.all(
        psbts.map(({ psbt, feeRate }) =>
          client.zadd(KEYS.PSBT.QUEUE, feeRate, psbt.toBase64())
        )
      );
    });
  });
  after(() => {
    Sinon.restore();
  });
  it("abort if fees estimates cannot be fetched", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getError({ error: "INTERNAL_SERVER_ERROR" })
    );
    expect(await batchTransactions()).to.be.false;
  });
  it("handles post tx errors", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates)
    );
    postTxStub.resolves(getError({ error: "INTERNAL_SERVER_ERROR" }));
    expect(await batchTransactions()).to.be.false;
  });
  it("handles batchBucket errors", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates)
    );
    batchBucketStub.resolves(getError("No psbts left to spend"));
    expect(await batchTransactions()).to.be.false;
  });
  it("does not batch if the time and size threshold have not been reached", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates)
    );
    await db.transaction(async (client) => {
      await client.set(KEYS.BUCKET.EXPIRATION, "true", 0);
    });
    Sinon.stub(constants, "BATCH_SIZE_THRESHOLD").value(Infinity);
    expect(await batchTransactions()).to.be.true;
    expect(batchBucketStub).to.have.not.been.called;
  });
  it("calls batch bucket with correct psbts, post transactions and return true on success", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates)
    );
    expect(await db.exists(KEYS.BUCKET.EXPIRATION)).to.be.false;
    expect(await batchTransactions()).to.be.true;

    expect(batchBucketStub).to.have.been.calledWith(psbts);

    const pending = await db.smembers(KEYS.TRANSACTION.PENDING);
    expect(pending.sort()).to.deep.equal([
      "b9ad9ccdfe6121b689bd08e8dcaf7155a2bc4a90a38fd8491d24de47565c583e",
    ]);

    expect(await db.exists(KEYS.BUCKET.EXPIRATION)).to.be.true;
  });
  it("increases the fee index after batching", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates)
    );
    expect(await db.exists(KEYS.FEE.INDEX)).to.be.false;
    expect(await batchTransactions()).to.be.true;
    expect(await db.get(KEYS.FEE.INDEX)).to.equal("1");
  });
});
