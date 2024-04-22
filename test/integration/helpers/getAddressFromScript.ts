import { networks, payments } from "bitcoinjs-lib";

export const getAddressFromScript = (script: Buffer) => {
  const p2wsh = payments.p2wsh({
    network: networks.regtest,
    redeem: {
      output: script,
      network: networks.regtest,
    },
  });
  return p2wsh.address;
};
