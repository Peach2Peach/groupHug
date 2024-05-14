type JobEvent = {
  date: Date;
  status: "RUNNING" | "OK" | "ERROR";
  runningTime?: number;
};
