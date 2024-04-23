import { getBucketStatus } from "../../src/utils/queue";
import {
  GetBatchStatusOverviewRequest,
  GetBatchStatusOverviewResponse,
} from "./types";

export const getBatchStatusOverviewController = async (
  _req: GetBatchStatusOverviewRequest,
  res: GetBatchStatusOverviewResponse,
) => {
  const status = await getBucketStatus();
  return res.json(status);
};
