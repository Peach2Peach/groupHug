declare type AddPSBTRequestParams = {}
declare type AddPSBTRequestQuery = {}
declare type AddPSBTRequestBody = { psbt: string; feeRate: number; index?: number }
declare type AddPSBTResponseBody = { id: string; revocationToken: string }
declare type AddPSBTErrorResponseBody = APIError<null>

declare type RevokePSBTRequestParams = {}
declare type RevokePSBTRequestQuery = {}
declare type RevokePSBTRequestBody = { id: string; revocationToken: string }
declare type RevokePSBTResponseBody = { success: boolean }
declare type RevokePSBTErrorResponseBody = APIError<null>
