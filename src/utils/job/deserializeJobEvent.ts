export const deserializeJobEvent = (str: string): JobEvent => {
  const [date, status, runningTime] = str.split('::')
  return {
    date: new Date(Number(date)),
    status: status as JobEvent['status'],
    runningTime: runningTime ? Number(runningTime) : undefined,
  }
}
