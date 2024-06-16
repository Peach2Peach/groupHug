import { Psbt } from "bitcoinjs-lib";
import { FEE } from "../../constants";
import { sumPSBTInputValues } from "./helpers/sumPSBTInputValues";

export function getServiceFees(psbts: Psbt[]) {
  const inputSum = psbts.reduce(
    (sum, psbt) => sum + sumPSBTInputValues(psbt),
    0,
  );
  return Math.round(inputSum * FEE);
}
