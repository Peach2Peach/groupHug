import { AES } from "crypto-js";
import { keys } from "../../src/utils/object";
import { oldXpriv, xpriv, xpub } from "./walletData";

export const unencrypted = {
  DB_AUTH: "DB_AUTH",
  PRIVKEY: xpriv,
  OLD_PRIVKEY: oldXpriv,
  FEE_COLLECTOR_PUBKEY: xpub,
};
export const encrypted = keys(unencrypted).reduce(
  (obj, key) => {
    obj[key] = AES.encrypt(unencrypted[key], "password").toString();
    return obj;
  },
  {} as Record<keyof typeof unencrypted, string>,
);
