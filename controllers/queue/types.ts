import { Request, Response } from "express";

export type AddPSBTRequest = Request<
  AddPSBTRequestParams,
  unknown,
  AddPSBTRequestBody,
  AddPSBTRequestQuery
>;
export type AddPSBTResponse = Response<
  AddPSBTResponseBody | AddPSBTErrorResponseBody
>;

export type RevokePSBTRequest = Request<
  RevokePSBTRequestParams,
  unknown,
  RevokePSBTRequestBody,
  RevokePSBTRequestQuery
>;
export type RevokePSBTResponse = Response<
  RevokePSBTResponseBody | RevokePSBTErrorResponseBody
>;
