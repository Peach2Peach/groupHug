import { script } from "bitcoinjs-lib";

export const getMultisigScript = (sellerPK: Buffer, peachPK: Buffer): Buffer =>
  script.fromASM(
    `
    OP_2
    ${sellerPK.toString("hex")}
    ${peachPK.toString("hex")}
    OP_2
    OP_CHECKMULTISIG
 `
      .trim()
      .replace(/\s+/gu, " "),
  );
