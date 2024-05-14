import { GetStatusRequest, GetStatusResponse } from "./types";

export const getStatusController = (
  req: GetStatusRequest,
  res: GetStatusResponse,
) => {
  res.json({
    error: null,
    status: "online",
    serverTime: Date.now(),
  });
};
