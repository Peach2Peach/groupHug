import { BIP32Interface } from "bip32";
import { Network } from "bitcoinjs-lib";
import { bip32 } from "../../constants";

export let hotWallet: BIP32Interface;
export let oldHotWallet: BIP32Interface;

export const loadHotWallet = (xpriv: string, network: Network) => {
  hotWallet = bip32.fromBase58(xpriv, network);
  return hotWallet;
};

export const loadOldHotWallet = (oldXpriv: string, network: Network) => {
  oldHotWallet = bip32.fromBase58(oldXpriv, network);
  return oldHotWallet;
};
