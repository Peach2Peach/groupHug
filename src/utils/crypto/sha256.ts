import { SHA256 } from "crypto-js";

export const sha256 = (str: string) => SHA256(str).toString();
