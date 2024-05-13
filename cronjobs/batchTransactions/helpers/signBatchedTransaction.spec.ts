import { networks, Psbt } from "bitcoinjs-lib";
import { expect } from "chai";
import Sinon from "sinon";
import * as keys from "../../../constants";
import { NETWORK } from "../../../constants";
import {
  loadHotWallet,
  loadOldHotWallet,
} from "../../../src/wallets/hotWallet";
import { unencrypted } from "../../../test/data/envData";
import { batchQueue } from "../../../test/data/psbtData";
import { signBatchedTransaction } from "./signBatchedTransaction";

describe("signBatchedTransaction", () => {
  it("signs the batched transaction", () => {
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    });
    signBatchedTransaction(
      psbt,
      batchQueue.map((b) => b.index.toString()),
    );
    expect(psbt.data.inputs[0].partialSig?.length).to.equal(2);
  });
  it("signs the batched transaction with old signer", () => {
    Sinon.stub(keys, "PRIVKEY").get(() => unencrypted.PRIVKEY);
    Sinon.stub(keys, "OLD_PRIVKEY").get(() => unencrypted.OLD_PRIVKEY);
    if (!keys.OLD_PRIVKEY || !keys.PRIVKEY) throw new Error("Keys not found");
    loadHotWallet(keys.OLD_PRIVKEY, NETWORK);
    loadOldHotWallet(keys.PRIVKEY, NETWORK);
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    });
    signBatchedTransaction(
      psbt,
      batchQueue.map((b) => b.index.toString()),
    );
    expect(psbt.data.inputs[0].partialSig?.length).to.equal(2);
    loadHotWallet(keys.PRIVKEY, NETWORK);
    loadOldHotWallet(keys.OLD_PRIVKEY, NETWORK);
  });
  it("does not sign if index is not found", () => {
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    });
    signBatchedTransaction(psbt, []);
    expect(psbt.data.inputs[0].partialSig?.length).to.equal(1);
  });
  it("does not sign if no the signer is not part of the multisig", () => {
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    });
    signBatchedTransaction(psbt, ["123", "456"]);
    expect(psbt.data.inputs[0].partialSig?.length).to.equal(1);
  });
  it("does not sign if no witness script is found", () => {
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    });
    psbt.data.inputs[0].witnessScript = undefined;
    signBatchedTransaction(
      psbt,
      batchQueue.map((b) => b.index.toString()),
    );
    expect(psbt.data.inputs[0].partialSig?.length).to.equal(1);
  });
});
