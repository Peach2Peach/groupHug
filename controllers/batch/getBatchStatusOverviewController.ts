import { BUCKETS } from "../../constants";
import { getBucketStatus } from "../../src/utils/queue";
import { isDefined } from "../../src/utils/validation";
import {
  GetBatchStatusOverviewRequest,
  GetBatchStatusOverviewResponse,
} from "./types";

export const getBatchStatusOverviewController = async (
  req: GetBatchStatusOverviewRequest,
  res: GetBatchStatusOverviewResponse,
) => {
  const indexes = Array(BUCKETS).fill(null);
  const statuses = await Promise.all(indexes.map((v, i) => getBucketStatus(i)));
  return res.json(statuses.filter(isDefined));
};
