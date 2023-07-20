declare type AddPSBTRequestParams = {}
declare type AddPSBTRequestQuery = {}
declare type AddPSBTRequestBody = {
  psbt: string
  feeRate: number
  index?: number
}
declare type AddPSBTResponseBody = {
  id: string
  revocationToken: string
}
declare type AddPSBTErrorResponseBody = APIError<null>
