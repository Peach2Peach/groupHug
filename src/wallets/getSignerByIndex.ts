import { BIP32Interface } from "bip32";
import { Network } from "bitcoinjs-lib";
import { getDerivationPathByIndex } from "./getDerivationPathByIndex";

export const getSignerByIndex = (
  hdWallet: BIP32Interface,
  index: number | string,
  network: Network,
) => hdWallet.derivePath(getDerivationPathByIndex(index, network));
