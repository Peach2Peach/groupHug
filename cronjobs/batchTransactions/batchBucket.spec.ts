import { networks, Psbt } from "bitcoinjs-lib";
import chai, { expect } from "chai";
import Sinon from "sinon";
import sinonChai from "sinon-chai";
import * as getTx from "../../src/utils/electrs/getTx";
import * as getUTXO from "../../src/utils/electrs/getUTXO";
import { addPSBTToQueue } from "../../src/utils/queue/addPSBTToQueue";
import { getResult } from "../../src/utils/result/getResult";
import blockExplorerData from "../../test/data/blockExplorerData.json";
import { batchQueue } from "../../test/data/psbtData";
import { batchBucket } from "./batchBucket";
import * as inputIsUnspent from "./helpers/inputIsUnspent";

chai.use(sinonChai);

describe("batchBucket", () => {
  const bucket = batchQueue.slice(0, 10).map(({ psbt }) => psbt);
  let getTxStub: Sinon.SinonStub;
  let getUTXOStub: Sinon.SinonStub;
  beforeEach(async () => {
    await Promise.all(
      batchQueue
        .slice(0, 10)
        .map(({ psbt, index }) =>
          addPSBTToQueue(
            Psbt.fromBase64(psbt, { network: networks.regtest }),
            index
          )
        )
    );
    getTxStub = Sinon.stub(getTx, "getTx").callsFake((txid) =>
      Promise.resolve({ result: { ...blockExplorerData.tx, txid } })
    );
    getUTXOStub = Sinon.stub(getUTXO, "getUTXO").callsFake(() =>
      Promise.resolve(
        getResult(
          blockExplorerData.utxo.map((utxo) => ({
            ...utxo,
            txid: "379a0e107a8fdfe49f1c3286d8ab2e62506cac4864d5f6ae40a393896f3540da",
          }))
        )
      )
    );
  });
  after(() => {
    Sinon.restore();
  });

  it("returns error if all psbts have been spent", async () => {
    getUTXOStub.resolves(getResult([]));
    const mediumFee = 21;
    const result = await batchBucket(bucket, mediumFee);

    expect(result.isError()).to.be.true;
    expect(result.getError()).to.equal("No psbts left to spend");
  });
  it("returns an error if no transactions are found", async () => {
    getTxStub.resolves(getResult(null));
    const mediumFee = 21;
    const result = await batchBucket(bucket, mediumFee);

    expect(result.isError()).to.be.true;
    expect(result.getError()).to.equal("No psbts left to spend");
  });
  it("returns an error if the transaction doesn't have a scriptpubkey_address", async () => {
    getTxStub.resolves(
      getResult({
        ...blockExplorerData.tx,
        vout: blockExplorerData.tx.vout.map((vout) => ({
          ...vout,
          scriptpubkey_address: undefined,
        })),
      })
    );
    const mediumFee = 21;
    const result = await batchBucket(bucket, mediumFee);

    expect(result.isError()).to.be.true;
    expect(result.getError()).to.equal("No psbts left to spend");
  });
  it("returns an error if no utxos are found", async () => {
    getUTXOStub.resolves(getResult(null));
    const mediumFee = 21;
    const result = await batchBucket(bucket, mediumFee);

    expect(result.isError()).to.be.true;
    expect(result.getError()).to.equal("No psbts left to spend");
  });

  it("creates a batched transaction with all psbts and correct fee output", async () => {
    Sinon.stub(inputIsUnspent, "inputIsUnspent").callsFake(() => true);
    const mediumFee = 21;
    const result = await batchBucket(bucket, mediumFee);

    if (!result.isOk()) {
      throw Error("batchBucket failed - " + result.getError());
    }
    const finalTransaction = result.getValue();

    expect(finalTransaction.ins.length).to.equal(10);
    expect(finalTransaction.outs.length).to.equal(11);
    expect(finalTransaction.outs[10].script.toString("hex")).to.equal(
      "0014c660079108cfbe1fe5278bc79eb1fee5afa9a201"
    );

    expect(finalTransaction.outs[10].value).to.equal(9569);
  });
  it("doesn't add a fee output if the fee is less than the dust limit", async () => {
    Sinon.stub(inputIsUnspent, "inputIsUnspent").callsFake(() => true);
    const highFee = 100;
    const result = await batchBucket(bucket, highFee);

    if (!result.isOk()) {
      throw Error("batchBucket failed" + result.getError());
    }
    const finalTransaction = result.getValue();

    expect(finalTransaction.ins.length).to.equal(10);
    expect(finalTransaction.outs.length).to.equal(10);
  });
});
