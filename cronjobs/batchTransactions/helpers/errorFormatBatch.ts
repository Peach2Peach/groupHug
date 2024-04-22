import { PSBTWithFeeRate } from "../../../src/utils/queue/getPSBTsFromQueue";

export const errorFormatBatch = (candidate: PSBTWithFeeRate[]) =>
  JSON.stringify(
    candidate.map(({ feeRate, psbt }) => ({ feeRate, psbt: psbt.toBase64() })),
  );
