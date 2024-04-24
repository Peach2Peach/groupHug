import { networks, Psbt } from "bitcoinjs-lib";
import chai, { expect } from "chai";
import Sinon, { SinonStub } from "sinon";
import sinonChai from "sinon-chai";
import { getTxIdOfInput } from "../../src/utils/psbt";
import { addPSBTToQueue, removePSBTFromQueue } from "../../src/utils/queue";
import { batchQueue } from "../../test/data/psbtData";
import { batchBucket } from "./batchBucket";
import * as calculateServiceFees from "./helpers/calculateServiceFees";
import * as getUTXOForInput from "./helpers/getUTXOForInput";

chai.use(sinonChai);

describe("batchBucket", () => {
  const psbts = batchQueue.map(({ feeRate, psbt, index }) => ({
    feeRate,
    psbt: Psbt.fromBase64(psbt, { network: networks.regtest }),
    index,
  }));

  const bucket = psbts.slice(0, 10);
  let getUTXOForInputStub: SinonStub;
  beforeEach(async () => {
    await Promise.all(
      bucket.map(({ psbt, feeRate, index }) =>
        addPSBTToQueue(psbt, feeRate, index)
      )
    );
    getUTXOForInputStub = Sinon.stub(
      getUTXOForInput,
      "getUTXOForInput"
    ).callsFake((input) =>
      Promise.resolve([
        {
          txid: getTxIdOfInput(input),
          vout: input.index,
          value: 100000000,
          status: {
            confirmed: true,
            block_height: 1,
            block_hash: "",
            block_time: 0,
          },
        },
      ])
    );
  });
  after(() => {
    Sinon.restore();
  });

  it("returns error if all psbts have been spent", async () => {
    getUTXOForInputStub.callsFake(() => Promise.resolve([]));
    const result = await batchBucket(bucket);

    expect(result.isError()).to.be.true;
    expect(result.getError()).to.equal("No psbts left to spend");
  });
  it("creates a batched transaction with all psbts and correct fee output", async () => {
    const result = await batchBucket(bucket);

    if (!result.isOk()) {
      throw Error("batchBucket failed" + result.getError());
    }
    const finalTransaction = result.getValue();

    expect(finalTransaction.ins.length).to.equal(10);
    expect(finalTransaction.outs.length).to.equal(11);
    expect(finalTransaction.outs[10].script.toString("hex")).to.equal(
      "0014b05c2fd2e1323e7cf7abb46757afef526c3f7b46"
    );
    expect(finalTransaction.outs[10].value).to.equal(34541);
  });
  it("doesn't add a fee output if the fee is less than the dust limit", async () => {
    await Promise.all(psbts.map(({ psbt }) => removePSBTFromQueue(psbt)));
    const highFeeBucket = psbts.slice(-10).map((e) => ({
      ...e,
      feeRate: 100,
    }));
    await Promise.all(
      highFeeBucket.map(({ psbt, index }) => addPSBTToQueue(psbt, 100, index))
    );
    Sinon.stub(calculateServiceFees, "calculateServiceFees").callsFake(() => 0);
    const result = await batchBucket(highFeeBucket);

    if (!result.isOk()) {
      throw Error("batchBucket failed" + result.getError());
    }
    const finalTransaction = result.getValue();

    expect(finalTransaction.ins.length).to.equal(10);
    expect(finalTransaction.outs.length).to.equal(10);
  });
});
