import { Network } from "bitcoinjs-lib";
import { loadFeeWallet } from "./feeWallet";
import { loadHotWallet, loadOldHotWallet } from "./hotWallet";

export const initWallets = (
  xpriv: string,
  oldXpriv: string,
  xpub: string,
  network: Network
) => {
  loadHotWallet(xpriv, network);
  loadOldHotWallet(oldXpriv, network);
  loadFeeWallet(xpub, network);
};
