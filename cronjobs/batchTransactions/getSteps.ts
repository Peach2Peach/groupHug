export const getSteps = (maxValue: number, numGroups: number) => {
  const stepSize = maxValue / numGroups
  const cutoffPoints = []

  for (let i = 1; i <= numGroups; i++) {
    const cutoff = Math.ceil(stepSize * i)
    cutoffPoints.push(cutoff)
  }

  return cutoffPoints
}
