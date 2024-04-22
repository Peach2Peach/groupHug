import { Psbt } from "bitcoinjs-lib";
import { sha256 } from "../crypto";
import { getExtraPSBTDataById } from "./getExtraPSBTDataById";

export const getExtraPSBTData = (psbt: Psbt) =>
  getExtraPSBTDataById(sha256(psbt.toBase64()));
