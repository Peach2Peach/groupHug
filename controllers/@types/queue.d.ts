declare type AddPSBTRequestParams = {}
declare type AddPSBTRequestQuery = {}
declare type AddPSBTRequestBody = {
  psbt: string
  feeRate: number
}
declare type AddPSBTResponseBody =
  | {
      id: string
      revocationToken: string
    }
  | APIError<null>
