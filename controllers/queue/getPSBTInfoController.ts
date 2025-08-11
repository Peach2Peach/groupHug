import { Psbt } from "bitcoinjs-lib";
import { Request, Response } from "express";
import { FEE, NETWORK, RESPONSE_CODES } from "../../constants";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { SHA256Schema } from "../../src/utils/validation/schemas";

type Res = Response<
  | {
      inputValue: number;
      outputValue: number;
      networkFee: number;
      serviceFee: number;
    }
  | APIError<"NOT_FOUND">
>;

export async function getPSBTInfoController(req: Request, res: Res) {
  try {
    const id = SHA256Schema.parse(req.params.id);

    const base64 = await db.client.hGet(KEYS.PSBT.PREFIX + id, "psbt");
    if (!base64) throw new Error("NOT_FOUND");

    const psbt = Psbt.fromBase64(base64, { network: NETWORK });
    const inputValue = psbt.data.inputs[0].witnessUtxo?.value;
    if (!inputValue) throw new Error("NOT_FOUND");
    const outputValue = psbt.txOutputs[0].value;
    const serviceFee = Math.round(inputValue * FEE);
    const networkFee = inputValue - outputValue - serviceFee;

    return res.json({
      inputValue,
      outputValue,
      networkFee,
      serviceFee,
    });
  } catch (error) {
    return res.status(RESPONSE_CODES.NOT_FOUND).json({ error: "NOT_FOUND" });
  }
}
