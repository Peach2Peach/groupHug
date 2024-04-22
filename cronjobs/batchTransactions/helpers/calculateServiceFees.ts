import { Psbt } from "bitcoinjs-lib";
import { sumPSBTOutputValues } from "./sumPSBTOutputValues";
import { sum } from "../../../src/utils/math";
import { sumPSBTInputValues } from "./sumPSBTInputValues";

export const calculateServiceFees = (psbts: Psbt[]) => {
  const inputValues = psbts.map(sumPSBTInputValues).reduce(sum, 0);
  const outputValues = psbts.map(sumPSBTOutputValues).reduce(sum, 0);
  return inputValues - outputValues;
};
