export const getSteps = (maxValue: number, numGroups: number) => {
  const stepCount = numGroups - 1;
  const stepSize = maxValue / stepCount;
  const cutoffPoints = [];

  for (let i = 1; i <= stepCount; i++) {
    const cutoff = Math.ceil(stepSize * i);
    cutoffPoints.push(cutoff);
  }

  return cutoffPoints;
};
