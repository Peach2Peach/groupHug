export function thousands(largeNumber: number): string {
  return largeNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/gu, " ");
}
