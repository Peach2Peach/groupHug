import { Request, Response } from "express";

export type GetStatusRequest = Request<
  GetStatusRequestParams,
  unknown,
  GetStatusRequestBody,
  GetStatusRequestQuery
>;
export type GetStatusResponse = Response<GetStatusResponseBody>;

export type StartRequest = Request<
  StartRequestParams,
  unknown,
  StartRequestBody,
  StartRequestQuery
>;
export type StartResponse = Response<StartResponseBody>;
