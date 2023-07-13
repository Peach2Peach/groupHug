import { Request, Response } from 'express'

export type GetStatusRequest = Request<GetStatusRequestParams, any, GetStatusRequestBody, GetStatusRequestQuery>
export type GetStatusResponse = Response<GetStatusResponseBody>

export type StartRequest = Request<StartRequestParams, any, StartRequestBody, StartRequestQuery>
export type StartResponse = Response<StartResponseBody>
