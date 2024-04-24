import { PsbtInput } from "bip174/src/lib/interfaces";
import { opcodes, payments, Psbt, script } from "bitcoinjs-lib";
import { NETWORK } from "../../../constants";
import { validatePSBTSignatures } from "./validatePSBTSignatures";

export const finalize = (psbt: Psbt) => {
  if (validatePSBTSignatures(psbt)) {
    psbt.txInputs.forEach((_input, i) => psbt.finalizeInput(i, getFinalScript));
    return psbt.extractTransaction();
  }
  throw Error("Signatures invalid for transaction");
};

const varuint = require("varuint-bitcoin");

function getFinalScript(
  inputIndex: number,
  input: PsbtInput,
  bitcoinScript: Buffer
) {
  if (!input.partialSig) {
    throw new Error("No partialSig found on input at index " + inputIndex);
  }

  const decompiled = script.decompile(bitcoinScript);
  if (!decompiled) {
    throw new Error(`Can not finalize input #${inputIndex}`);
  }

  const meaningfulSignatures = input.partialSig.every(
    (sig) =>
      bitcoinScript.toString("hex").indexOf(sig.pubkey.toString("hex")) !== -1
  );
  if (!meaningfulSignatures) {
    throw new Error(
      `Can not finalize input #${inputIndex}. Signatures do not correspond to public keys`
    );
  }

  const sortedSignatures = input.partialSig
    .sort(
      (a, b) =>
        bitcoinScript.indexOf(b.pubkey) - bitcoinScript.indexOf(a.pubkey)
    )
    .map(({ signature }) => signature);

  const payment = payments.p2wsh({
    network: NETWORK,
    redeem: {
      network: NETWORK,
      output: bitcoinScript,
      input: script.compile(
        sortedSignatures.length > 1
          ? [...sortedSignatures, opcodes.OP_FALSE]
          : sortedSignatures
      ),
    },
  });

  return {
    finalScriptSig: undefined,
    finalScriptWitness:
      payment.witness && payment.witness.length > 0
        ? witnessStackToScriptWitness(payment.witness)
        : undefined,
  };
}

function witnessStackToScriptWitness(witness: Buffer[]) {
  let buffer = Buffer.allocUnsafe(0);

  const writeSlice = (slice: Buffer): void => {
    buffer = Buffer.concat([buffer, Buffer.from(slice)]);
  };

  const writeVarInt = (i: number): void => {
    const currentLen = buffer.length;
    const varintLen = varuint.encodingLength(i);

    buffer = Buffer.concat([buffer, Buffer.allocUnsafe(varintLen)]);
    varuint.encode(i, buffer, currentLen);
  };

  const writeVarSlice = (slice: Buffer): void => {
    writeVarInt(slice.length);
    writeSlice(slice);
  };

  const writeVector = (vector: Buffer[]): void => {
    writeVarInt(vector.length);
    vector.forEach(writeVarSlice);
  };

  writeVector(witness);

  return buffer;
}
