import { payments } from "bitcoinjs-lib";
import { NETWORK } from "../../../constants";
import { feeWallet } from "../../../src/wallets";

export const getFeeAddress = () => {
  const feeCollector = feeWallet.derivePath("0/0");

  return payments.p2wpkh({
    pubkey: feeCollector.publicKey,
    network: NETWORK,
  }).address;
};
