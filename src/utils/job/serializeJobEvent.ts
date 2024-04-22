export const serializeJobEvent = (event: JobEvent) =>
  `${event.date.getTime()}::${event.status}::${event.runningTime}`;
