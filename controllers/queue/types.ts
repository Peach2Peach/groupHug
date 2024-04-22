import { Request, Response } from "express";

export type AddPSBTRequest = Request<
  AddPSBTRequestParams,
  any,
  AddPSBTRequestBody,
  AddPSBTRequestQuery
>;
export type AddPSBTResponse = Response<
  AddPSBTResponseBody | AddPSBTErrorResponseBody
>;

export type RevokePSBTRequest = Request<
  RevokePSBTRequestParams,
  any,
  RevokePSBTRequestBody,
  RevokePSBTRequestQuery
>;
export type RevokePSBTResponse = Response<
  RevokePSBTResponseBody | RevokePSBTErrorResponseBody
>;
