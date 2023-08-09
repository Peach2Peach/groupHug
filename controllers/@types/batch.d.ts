declare type GetBatchStatusRequestParams = {}
declare type GetBatchStatusRequestQuery = { feeRate: string }
declare type GetBatchStatusRequestBody = {}
declare type GetBatchStatusResponseBody = {
  participants: number
  maxParticipants: number
  timeRemaining: number
}
declare type GetBatchStatusErrorResponseBody = APIError<null>
