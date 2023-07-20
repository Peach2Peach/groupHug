import { Request, Response } from 'express'

export type AddPSBTRequest = Request<AddPSBTRequestParams, any, AddPSBTRequestBody, AddPSBTRequestQuery>
export type AddPSBTResponse = Response<AddPSBTResponseBody | AddPSBTErrorResponseBody>
