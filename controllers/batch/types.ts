import { Request, Response } from 'express'

export type GetBatchStatusRequest = Request<
  GetBatchStatusRequestParams,
  any,
  GetBatchStatusRequestBody,
  GetBatchStatusRequestQuery
>
export type GetBatchStatusResponse = Response<GetBatchStatusResponseBody | GetBatchStatusErrorResponseBody>

export type GetBatchStatusOverviewRequest = Request<
  GetBatchStatusOverviewRequestParams,
  any,
  GetBatchStatusOverviewRequestBody,
  GetBatchStatusOverviewRequestQuery
>
export type GetBatchStatusOverviewResponse = Response<
  GetBatchStatusOverviewResponseBody | GetBatchStatusOverviewErrorResponseBody
>
