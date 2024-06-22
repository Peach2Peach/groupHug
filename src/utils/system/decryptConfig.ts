import { AES, enc } from "crypto-js";
import * as constants from "../../../constants";

export let decrypted = false;
export const setDecrypted = (d: boolean) => (decrypted = d);

export const decryptConfig = (password: string) => {
  if (
    !constants.DB_AUTH ||
    !constants.PRIVKEY ||
    !constants.OLD_PRIVKEY ||
    !constants.FEE_COLLECTOR_PUBKEY
  ) {
    throw new Error("Config not loaded");
  }
  setDecrypted(decrypted || !constants.PASSWORDPROTECTION);

  if (decrypted) {
    return {
      DB_AUTH: constants.DB_AUTH,
      PRIVKEY: constants.PRIVKEY,
      OLD_PRIVKEY: constants.OLD_PRIVKEY,
      FEE_COLLECTOR_PUBKEY: constants.FEE_COLLECTOR_PUBKEY,
    };
  }

  try {
    if (
      AES.decrypt(constants.DB_AUTH, password).toString(enc.Utf8).length === 0
    ) {
      throw new Error("Password invalid");
    }
  } catch (e) {
    throw new Error("Password invalid");
  }

  setDecrypted(true);
  return {
    DB_AUTH: AES.decrypt(constants.DB_AUTH, password).toString(enc.Utf8),
    PRIVKEY: AES.decrypt(constants.PRIVKEY, password).toString(enc.Utf8),
    OLD_PRIVKEY: AES.decrypt(constants.OLD_PRIVKEY, password).toString(
      enc.Utf8,
    ),
    FEE_COLLECTOR_PUBKEY: AES.decrypt(
      constants.FEE_COLLECTOR_PUBKEY,
      password,
    ).toString(enc.Utf8),
  };
};
