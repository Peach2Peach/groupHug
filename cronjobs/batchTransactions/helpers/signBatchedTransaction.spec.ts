import { networks, Psbt } from "bitcoinjs-lib";
import { expect } from "chai";
import Sinon from "sinon";
import { NETWORK } from "../../../constants";
import * as keys from "../../../src/utils/system/decryptConfig";
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
    signBatchedTransaction(psbt, [
      {
        index: batchQueue[0].index,
        psbt: "psbt",
        revocationToken: "revocationToken",
      },
    ]);
    expect(psbt.data.inputs[0].partialSig.length).to.equal(2);
  });
  it("signs the batched transaction with old signer", () => {
    Sinon.stub(keys, "PRIVKEY").get(() => unencrypted.PRIVKEY);
    Sinon.stub(keys, "OLD_PRIVKEY").get(() => unencrypted.OLD_PRIVKEY);
    loadHotWallet(keys.OLD_PRIVKEY, NETWORK);
    loadOldHotWallet(keys.PRIVKEY, NETWORK);
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    });
    signBatchedTransaction(psbt, [
      {
        index: batchQueue[0].index,
        psbt: "psbt",
        revocationToken: "revocationToken",
      },
    ]);
    expect(psbt.data.inputs[0].partialSig.length).to.equal(2);
    loadHotWallet(keys.PRIVKEY, NETWORK);
    loadOldHotWallet(keys.OLD_PRIVKEY, NETWORK);
  });
  it("does not sign if no index is passed", () => {
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    });
    signBatchedTransaction(psbt, [
      { psbt: "psbt", revocationToken: "revocationToken" },
    ]);
    expect(psbt.data.inputs[0].partialSig.length).to.equal(1);
  });
  it("does not sign if no the signer is not part of the multisig", () => {
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    });
    signBatchedTransaction(psbt, [
      { index: 123, psbt: "psbt", revocationToken: "revocationToken" },
    ]);
    expect(psbt.data.inputs[0].partialSig.length).to.equal(1);
  });
});
