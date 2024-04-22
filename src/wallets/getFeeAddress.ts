import { payments } from "bitcoinjs-lib";
import { feeWallet } from "./feeWallet";
import { NETWORK } from "../../constants";

export const getFeeAddress = (index: number) => {
  const feeCollector = feeWallet.derivePath(`0/${index}`);

  return payments.p2wpkh({
    pubkey: feeCollector.publicKey,
    network: NETWORK,
  }).address;
};
