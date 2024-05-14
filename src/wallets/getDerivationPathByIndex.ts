import { Network, networks } from "bitcoinjs-lib";

export const getDerivationPathByIndex = (
  index: number | string,
  network: Network,
) => `m/48'/${network === networks.testnet ? "1" : "0"}'/0'/0/${index}`;
