import { Psbt, networks } from "bitcoinjs-lib";
import chai, { expect } from "chai";
import Sinon, { SinonStub } from "sinon";
import sinonChai from "sinon-chai";
import { addPSBTToQueue } from "../../src/utils/queue";
import { batchQueue } from "../../test/data/psbtData";
import { spiceUTXOWithPSBT } from "../../test/unit/helpers/spiceUTXOWithPSBT";
import { batchBucket } from "./batchBucket";
import * as getUnspentPsbts from "./helpers/getUnspentPsbts";

chai.use(sinonChai);

describe("batchBucket", () => {
  let getUnspentPsbtsStub: SinonStub;
  const psbts = batchQueue.map(({ feeRate, psbt, index }) => ({
    feeRate,
    psbt: Psbt.fromBase64(psbt, { network: networks.regtest }),
    index,
  }));

  const bucket = psbts.slice(0, 10);
  beforeEach(async () => {
    getUnspentPsbtsStub = Sinon.stub(
      getUnspentPsbts,
      "getUnspentPsbts",
    ).callsFake((_psbts: Psbt[]) =>
      Promise.resolve({
        psbts: _psbts,
        utxos: _psbts.map((psbt) => spiceUTXOWithPSBT(psbt)),
      }),
    );

    await Promise.all(
      psbts
        .slice(0, 10)
        .map(({ psbt, feeRate, index }) =>
          addPSBTToQueue(psbt, feeRate, index),
        ),
    );
  });
  after(() => {
    Sinon.restore();
  });

  it("returns error if all psbts have been spent", async () => {
    getUnspentPsbtsStub.resolves({ psbts: [], utxos: [] });
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
      "0014b05c2fd2e1323e7cf7abb46757afef526c3f7b46",
    );
    expect(finalTransaction.outs[10].value).to.equal(34541);
  });
});
