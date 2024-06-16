/* eslint-disable max-statements */
/* eslint-disable no-await-in-loop */
import { networks, Psbt } from "bitcoinjs-lib";
import { expect } from "chai";
import { before, describe, it } from "mocha";
import { setNetwork, SIGHASH } from "../../constants";
import { finalize } from "../../src/utils/psbt/finalize";
import { signAllInputs } from "../../src/utils/psbt/signAllInputs";
import { loadFeeWallet } from "../../src/wallets/feeWallet";
import { getSignerByIndex } from "../../src/wallets/getSignerByIndex";
import {
  hotWallet,
  loadHotWallet,
  oldHotWallet,
} from "../../src/wallets/hotWallet";
import { xpriv, xpub } from "../data/walletData";
import { buildPSBT } from "./helpers/buildPSBT";
import { getAddressFromScript } from "./helpers/getAddressFromScript";
import { getFeeAddress } from "./helpers/getFeeAddress";
import { getMultisigScript } from "./helpers/getMultisigScript";
import { psbt1, psbt2, psbt3 } from "./psbt";
import { buyerAddress, seller } from "./signers";
import { regtestUtils } from "./_regtest";

describe("batching", () => {
  before(async () => {
    setNetwork(networks.regtest);
    loadFeeWallet(xpub, networks.regtest);
    loadHotWallet(xpriv, networks.regtest);

    await regtestUtils.mine(11);
  });

  it("Can combine psbts", async () => {
    if (!buyerAddress) throw new Error("Buyer address not set");
    const signer1 = getSignerByIndex(hotWallet, psbt1.index, networks.regtest);
    const oldSigner1 = getSignerByIndex(
      oldHotWallet,
      psbt1.index,
      networks.regtest,
    );
    const signer2 = getSignerByIndex(hotWallet, psbt2.index, networks.regtest);
    const oldSigner2 = getSignerByIndex(
      oldHotWallet,
      psbt2.index,
      networks.regtest,
    );
    const signer3 = getSignerByIndex(hotWallet, psbt3.index, networks.regtest);
    const oldSigner3 = getSignerByIndex(
      oldHotWallet,
      psbt3.index,
      networks.regtest,
    );
    const escrowScript1 = getMultisigScript(
      seller.publicKey,
      signer1.publicKey,
    );
    const escrowScript2 = getMultisigScript(
      seller.publicKey,
      signer2.publicKey,
    );
    const escrowScript3 = getMultisigScript(
      seller.publicKey,
      signer3.publicKey,
    );
    const address1 = getAddressFromScript(escrowScript1);
    const address2 = getAddressFromScript(escrowScript2);
    const address3 = getAddressFromScript(escrowScript3);
    if (!address1 || !address2 || !address3)
      throw new Error("Addresses not set");
    const fundingUTXO1 = await regtestUtils.faucet(address1, 100000);
    const fundingUTXO2 = await regtestUtils.faucet(address2, 200000);
    const fundingUTXO3 = await regtestUtils.faucet(address3, 300000);
    const transaction1 = buildPSBT(escrowScript1, fundingUTXO1, buyerAddress);
    const transaction2 = buildPSBT(escrowScript2, fundingUTXO2, buyerAddress);
    const transaction3 = buildPSBT(escrowScript3, fundingUTXO3, buyerAddress);

    [transaction1, transaction2, transaction3].forEach((tx) =>
      tx.txInputs.forEach((input, i) => {
        tx.updateInput(i, { sighashType: SIGHASH.SINGLE_ANYONECANPAY });
        tx.signInput(i, seller, [SIGHASH.SINGLE_ANYONECANPAY]);
      }),
    );

    const batchedTransaction = new Psbt({ network: networks.regtest });
    const txs = [transaction1, transaction2, transaction3];
    batchedTransaction.addInputs(
      txs.map((tx) => ({ ...tx.txInputs[0], ...tx.data.inputs[0] })),
    );
    batchedTransaction.addOutputs(txs.map((tx) => tx.txOutputs[0]));
    const feeAddress = getFeeAddress();
    if (!feeAddress) throw new Error("Fee address not set");

    batchedTransaction.addOutput({
      address: feeAddress,
      value:
        (fundingUTXO1.value + fundingUTXO2.value + fundingUTXO3.value) * 0.02,
    });

    expect(batchedTransaction.txOutputs.length).to.equal(4);

    signAllInputs(batchedTransaction, signer1, oldSigner1);
    signAllInputs(batchedTransaction, signer2, oldSigner2);
    signAllInputs(batchedTransaction, signer3, oldSigner3);

    const finalTransaction = finalize(batchedTransaction);

    await regtestUtils.broadcast(finalTransaction.toHex());

    const txId = finalTransaction.getId();

    await regtestUtils.verify({
      txId,
      address: buyerAddress,
      vout: 0,
      value: 96290,
    });
    await regtestUtils.verify({
      txId,
      address: buyerAddress,
      vout: 1,
      value: 194290,
    });
    await regtestUtils.verify({
      txId,
      address: buyerAddress,
      vout: 2,
      value: 292290,
    });
    await regtestUtils.verify({
      txId,
      address: "bcrt1qcesq0ygge7lplef830reav07ukh6ngspc6h7pm",
      vout: 3,
      value: 12000,
    });
  });

  it("Can combine psbts with different signers", async () => {
    if (!buyerAddress) throw new Error("Buyer address not set");
    const signer1 = getSignerByIndex(hotWallet, psbt1.index, networks.regtest);
    const oldSigner1 = getSignerByIndex(
      oldHotWallet,
      psbt1.index,
      networks.regtest,
    );
    const signer2 = getSignerByIndex(hotWallet, psbt2.index, networks.regtest);
    const oldSigner2 = getSignerByIndex(
      oldHotWallet,
      psbt2.index,
      networks.regtest,
    );
    const signer3 = getSignerByIndex(hotWallet, psbt3.index, networks.regtest);
    const oldSigner3 = getSignerByIndex(
      oldHotWallet,
      psbt3.index,
      networks.regtest,
    );
    const escrowScript1 = getMultisigScript(
      seller.publicKey,
      signer1.publicKey,
    );
    const escrowScript2 = getMultisigScript(
      seller.publicKey,
      oldSigner2.publicKey,
    );
    const escrowScript3 = getMultisigScript(
      seller.publicKey,
      signer3.publicKey,
    );
    const address1 = getAddressFromScript(escrowScript1);
    const address2 = getAddressFromScript(escrowScript2);
    const address3 = getAddressFromScript(escrowScript3);
    if (!address1 || !address2 || !address3)
      throw new Error("Addresses not set");
    const fundingUTXO1 = await regtestUtils.faucet(address1, 100000);
    const fundingUTXO2 = await regtestUtils.faucet(address2, 200000);
    const fundingUTXO3 = await regtestUtils.faucet(address3, 300000);
    const transaction1 = buildPSBT(escrowScript1, fundingUTXO1, buyerAddress);
    const transaction2 = buildPSBT(escrowScript2, fundingUTXO2, buyerAddress);
    const transaction3 = buildPSBT(escrowScript3, fundingUTXO3, buyerAddress);

    [transaction1, transaction2, transaction3].forEach((tx) =>
      tx.txInputs.forEach((input, i) => {
        tx.updateInput(i, { sighashType: SIGHASH.SINGLE_ANYONECANPAY });
        tx.signInput(i, seller, [SIGHASH.SINGLE_ANYONECANPAY]);
      }),
    );

    const batchedTransaction = new Psbt({ network: networks.regtest });
    const txs = [transaction1, transaction2, transaction3];
    batchedTransaction.addInputs(
      txs.map((tx) => ({ ...tx.txInputs[0], ...tx.data.inputs[0] })),
    );
    batchedTransaction.addOutputs(txs.map((tx) => tx.txOutputs[0]));
    const feeAddress = getFeeAddress();
    if (!feeAddress) throw new Error("Fee address not set");
    batchedTransaction.addOutput({
      address: feeAddress,
      value:
        (fundingUTXO1.value + fundingUTXO2.value + fundingUTXO3.value) * 0.02,
    });

    expect(batchedTransaction.txOutputs.length).to.equal(4);

    signAllInputs(batchedTransaction, signer1, oldSigner1);
    signAllInputs(batchedTransaction, signer2, oldSigner2);
    signAllInputs(batchedTransaction, signer3, oldSigner3);

    const finalTransaction = finalize(batchedTransaction);

    await regtestUtils.broadcast(finalTransaction.toHex());

    const txId = finalTransaction.getId();

    await regtestUtils.verify({
      txId,
      address: buyerAddress,
      vout: 0,
      value: 96290,
    });
    await regtestUtils.verify({
      txId,
      address: buyerAddress,
      vout: 1,
      value: 194290,
    });
    await regtestUtils.verify({
      txId,
      address: buyerAddress,
      vout: 2,
      value: 292290,
    });
    await regtestUtils.verify({
      txId,
      address: "bcrt1qcesq0ygge7lplef830reav07ukh6ngspc6h7pm",
      vout: 3,
      value: 12000,
    });
  });
});
