import { Psbt, Transaction, networks } from "bitcoinjs-lib";
import chai, { expect } from "chai";
import Sinon, { SinonStub } from "sinon";
import sinonChai from "sinon-chai";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import * as getFeeEstimates from "../../src/utils/electrs/getFeeEstimates";
import * as postTx from "../../src/utils/electrs/postTx";
import { addPSBTToQueueWithClient } from "../../src/utils/queue";
import * as getExtraPSBTData from "../../src/utils/queue/getExtraPSBTData";
import { getError, getResult } from "../../src/utils/result";
import { feeEstimates } from "../../test/data/electrsData";
import { batchQueue } from "../../test/data/psbtData";
import { spiceUTXOWithPSBT } from "../../test/unit/helpers/spiceUTXOWithPSBT";
import * as batchBucket from "./batchBucket";
import { batchTransactions } from "./batchTransactions";
import * as getUnspentPsbts from "./helpers/getUnspentPsbts";
import * as hasBucketReachedTimeThreshold from "./helpers/hasBucketReachedTimeThreshold";
import * as isBucketReadyForBatch from "./helpers/isBucketReadyForBatch";

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
    Sinon.stub(getUnspentPsbts, "getUnspentPsbts").callsFake((_psbts: Psbt[]) =>
      Promise.resolve({
        psbts: _psbts,
        utxos: _psbts.map((psbt) => spiceUTXOWithPSBT(psbt)),
      }),
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
  it("does not batch if the time threshold has not been reached and the bucket is not ready", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates),
    );
    Sinon.stub(
      hasBucketReachedTimeThreshold,
      "hasBucketReachedTimeThreshold",
    ).resolves(false);
    Sinon.stub(isBucketReadyForBatch, "isBucketReadyForBatch").returns(false);
    expect(await batchTransactions()).to.be.true;
    expect(batchBucketStub).to.have.not.been.called;
  });
  it("calls batch buckets with correct psbts, post transactions and return true on success", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates),
    );
    expect(await hasBucketReachedTimeThreshold.hasBucketReachedTimeThreshold())
      .to.be.true;
    expect(await batchTransactions()).to.be.true;

    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(80, 100));
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(68, 80));
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(61, 68));
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(54, 61));
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(51, 54));
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(47, 51));
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(37, 47));
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(25, 37));
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(9, 25));
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(0, 9));

    const pending = await db.smembers(KEYS.TRANSACTION.PENDING);
    expect(pending.sort()).to.deep.equal([
      "150d4a1cb68a9d53a5b44e2521af3f1cede2a7e2e92e0879e9d1dc5e875f4a39",
      "4fd039b76e71d117de310c0cb3d5011dca0a4ef51ea23abdfe2d351e95662ba8",
      "51695feea9c1da482e96f0a0f5c4b3574cf558afcda4bdd6c5f6ebf006b85072",
      "67f9a55097960d6d00639d7a48dc92a4f409446f5b05a36c8afbf17180770978",
      "6fec6fcf5a28b6e2da4fce8fe27069ba9348a2e7ca8f0ae5eb984cef885d6791",
      "bfc47b75e36057e599892c1754a783cc53760b9d80532cd99979d356db3cecf8",
      "e5addd0bffce7d8a8273cc7555834cd6b6bd7c2a4453e687b32e645ab408b18c",
      "e89ed196629c326f5f039bdedc8b688300afb39c632125c8da237a76df8234fe",
      "ee89bcb1bb73c0985e5927e16df7c9ceb7c54a388599e28afcf20c91182958d7",
      "ef939a8608090bc4d20ebee5150f8ee958bcd9102c2a124b8fd083223fd9eb2e",
    ]);

    expect(await hasBucketReachedTimeThreshold.hasBucketReachedTimeThreshold())
      .to.be.false;
  });
});
