import { Network, networks } from "bitcoinjs-lib";

export const isTestnet = (network: Network) => network === networks.testnet;
