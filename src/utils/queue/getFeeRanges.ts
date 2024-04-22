export const getFeeRanges = (steps: number[]) => {
  const ranges = steps.map((value, i, self) => [
    i === 0 ? 1 : self[i - 1],
    value,
  ]);
  // @ts-ignore
  ranges.push([steps[steps.length - 1], undefined]);
  return ranges;
};
