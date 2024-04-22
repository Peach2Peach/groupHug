import { Psbt } from "bitcoinjs-lib";
import { NETWORK, SIGHASH } from "../../../constants";
import { PSBTInfo } from "../../../src/utils/queue/getExtraPSBTDataById";
import { getSignerByIndex, hotWallet } from "../../../src/wallets";
import { oldHotWallet } from "../../../src/wallets/hotWallet";
import { logger } from "../batchTransactions";

export const signBatchedTransaction = (
  batchedTransaction: Psbt,
  extraPSBTData: PSBTInfo[],
) => {
  batchedTransaction.txInputs.forEach((input, i) => {
    logger.debug(["signing psbt", i, JSON.stringify(extraPSBTData[i])]);
    if (!extraPSBTData[i].index) return;

    const signer = getSignerByIndex(hotWallet, extraPSBTData[i].index, NETWORK);
    if (
      !batchedTransaction.data.inputs[i].witnessScript.includes(
        signer.publicKey,
      )
    ) {
      const oldSigner = getSignerByIndex(
        oldHotWallet,
        extraPSBTData[i].index,
        NETWORK,
      );
      if (
        batchedTransaction.data.inputs[i].witnessScript.includes(
          oldSigner.publicKey,
        )
      ) {
        delete batchedTransaction.data.inputs[i].sighashType;
        batchedTransaction.updateInput(i, { sighashType: SIGHASH.ALL });
        batchedTransaction.signInput(i, oldSigner, [SIGHASH.ALL]);
        return;
      }

      logger.debug([
        "psbt still did not include signer public key",
        batchedTransaction.data.inputs[i].witnessScript.toString("hex"),
        signer.publicKey.toString("hex"),
      ]);

      return;
    }

    delete batchedTransaction.data.inputs[i].sighashType;
    batchedTransaction.updateInput(i, { sighashType: SIGHASH.ALL });
    batchedTransaction.signInput(i, signer, [SIGHASH.ALL]);
  });
};
