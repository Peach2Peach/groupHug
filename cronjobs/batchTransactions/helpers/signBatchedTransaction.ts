import { BIP32Interface } from "bip32";
import { Psbt } from "bitcoinjs-lib";
import { NETWORK, SIGHASH } from "../../../constants";
import { getSignerByIndex } from "../../../src/wallets/getSignerByIndex";
import { hotWallet, oldHotWallet } from "../../../src/wallets/hotWallet";
import { logger } from "../batchTransactions";

export const signBatchedTransaction = (
  batchedTransaction: Psbt,
  indexes: (string | undefined)[],
) => {
  batchedTransaction.txInputs.forEach((_input, i) => {
    const index = indexes[i];
    if (!index) return;

    const signer = getSignerByIndex(hotWallet, index, NETWORK);
    const { witnessScript } = batchedTransaction.data.inputs[i];
    if (!witnessScript) {
      logger.debug(["no witness script found at index ", i]);
      return;
    }
    if (!witnessScript.includes(signer.publicKey)) {
      const oldSigner = getSignerByIndex(oldHotWallet, index, NETWORK);
      if (witnessScript.includes(oldSigner.publicKey)) {
        updateAndSign(batchedTransaction, i, oldSigner);
        return;
      }

      logger.debug([
        "psbt still did not include signer public key",
        witnessScript.toString("hex"),
        signer.publicKey.toString("hex"),
      ]);

      return;
    }
    updateAndSign(batchedTransaction, i, signer);
  });
};

function updateAndSign(
  batchedTransaction: Psbt,
  i: number,
  signer: BIP32Interface,
) {
  delete batchedTransaction.data.inputs[i].sighashType;
  batchedTransaction.updateInput(i, { sighashType: SIGHASH.ALL });
  batchedTransaction.signInput(i, signer, [SIGHASH.ALL]);
}
