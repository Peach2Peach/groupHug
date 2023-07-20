import { PsbtInput } from 'bip174/src/lib/interfaces'
import { opcodes, payments, script } from 'bitcoinjs-lib'
import { NETWORK } from '../../../constants'

const varuint = require('varuint-bitcoin')

const network = NETWORK

const witnessStackToScriptWitness = (witness: Buffer[]): Buffer => {
  let buffer = Buffer.allocUnsafe(0)

  const writeSlice = (slice: Buffer): void => {
    buffer = Buffer.concat([buffer, Buffer.from(slice)])
  }

  const writeVarInt = (i: number): void => {
    const currentLen = buffer.length
    const varintLen = varuint.encodingLength(i)

    buffer = Buffer.concat([buffer, Buffer.allocUnsafe(varintLen)])
    varuint.encode(i, buffer, currentLen)
  }

  const writeVarSlice = (slice: Buffer): void => {
    writeVarInt(slice.length)
    writeSlice(slice)
  }

  const writeVector = (vector: Buffer[]): void => {
    writeVarInt(vector.length)
    vector.forEach(writeVarSlice)
  }

  writeVector(witness)

  return buffer
}

export const getFinalScript = (
  inputIndex: number,
  input: PsbtInput,
  bitcoinScript: Buffer,
): {
  finalScriptSig: Buffer | undefined
  finalScriptWitness: Buffer | undefined
} => {
  const decompiled = script.decompile(bitcoinScript)

  const meaningFulSignatures = input.partialSig.every(
    (sig) =>
      bitcoinScript.toString('hex').indexOf(sig.pubkey.toString('hex')) !== -1,
  )
  if (!decompiled) {
    throw new Error(`Can not finalize input #${inputIndex}`)
  }
  if (!meaningFulSignatures) {
    throw new Error(
      `Can not finalize input #${inputIndex}. Signatures do not correspond to public keys`,
    )
  }

  const sortedSignatures = input.partialSig
    .sort(
      (a, b) =>
        bitcoinScript.indexOf(b.pubkey) - bitcoinScript.indexOf(a.pubkey),
    )
    .map((partialSig) => partialSig.signature)
    .reverse()

  const payment = payments.p2wsh({
    network,
    redeem: {
      network,
      output: bitcoinScript,
      input: script.compile(
        sortedSignatures.length > 1
          ? [opcodes.OP_0, ...sortedSignatures]
          : sortedSignatures,
      ),
    },
  })

  return {
    finalScriptSig: undefined,
    finalScriptWitness:
      payment.witness && payment.witness.length > 0
        ? witnessStackToScriptWitness(payment.witness)
        : undefined,
  }
}
