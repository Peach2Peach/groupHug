export function getExcessMiningFees(
  feePreference: number,
  txSize: number,
  actualFeesPaid: number,
) {
  return Math.round(actualFeesPaid - feePreference * txSize);
}
