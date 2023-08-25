declare type GetBatchStatusRequestParams = {}
declare type GetBatchStatusRequestQuery = { feeRate?: string; id?: string }
declare type GetBatchStatusRequestBody = {}
declare type GetBatchStatusResponseBody = {
  participants: number
  maxParticipants: number
  timeRemaining: number
  feeRange?: number[]
  completed: boolean
  txId?: string
}
declare type GetBatchStatusErrorResponseBody = APIError<null>

declare type GetBatchStatusOverviewRequestParams = {}
declare type GetBatchStatusOverviewRequestQuery = {}
declare type GetBatchStatusOverviewRequestBody = {}
declare type GetBatchStatusOverviewResponseBody = GetBatchStatusResponseBody[]
declare type GetBatchStatusOverviewErrorResponseBody = APIError<null>
