export function getExcessMiningFees(
  feePreference: number,
  actualFeeRate: number,
  txSize: number,
) {
  return Math.round((actualFeeRate - feePreference) * txSize);
}
