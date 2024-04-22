type GetBatchStatusRequestParams = {};
type GetBatchStatusRequestQuery = { feeRate?: string; id?: string };
type GetBatchStatusRequestBody = {};
type GetBatchStatusResponseBody = {
  participants: number;
  maxParticipants: number;
  timeRemaining: number;
  feeRange?: number[];
  completed: boolean;
  txId?: string;
};
type GetBatchStatusErrorResponseBody = APIError<null>;

type GetBatchStatusOverviewRequestParams = {};
type GetBatchStatusOverviewRequestQuery = {};
type GetBatchStatusOverviewRequestBody = {};
type GetBatchStatusOverviewResponseBody = GetBatchStatusResponseBody[];
type GetBatchStatusOverviewErrorResponseBody = APIError<null>;
