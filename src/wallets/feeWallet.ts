import { BIP32Interface } from "bip32";
import { bip32 } from "../../constants";
import { Network } from "bitcoinjs-lib";

export let feeWallet: BIP32Interface;
export const loadFeeWallet = (xpub: string, network: Network) => {
  feeWallet = bip32.fromBase58(xpub, network);
  return feeWallet;
};
