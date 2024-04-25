import { payments } from "bitcoinjs-lib";
import { NETWORK } from "../../constants";
import { feeWallet } from "./feeWallet";

export const getFeeAddress = (index: number) => {
  const feeCollector = feeWallet.derivePath(`0/${index}`);

  return payments.p2wpkh({
    pubkey: feeCollector.publicKey,
    network: NETWORK,
  }).address;
};
