const base10 = 10;
export const round = (num: number, digits = 0) => {
  const exp = base10 ** digits;
  return Math.round(num * exp) / exp;
};
