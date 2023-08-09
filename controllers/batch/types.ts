import { Request, Response } from 'express'

export type GetBatchStatusRequest = Request<
  GetBatchStatusRequestParams,
  any,
  GetBatchStatusRequestBody,
  GetBatchStatusRequestQuery
>
export type GetBatchStatusResponse = Response<GetBatchStatusResponseBody | GetBatchStatusErrorResponseBody>
