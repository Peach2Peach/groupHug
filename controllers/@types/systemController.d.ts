declare type GetStatusRequestParams = {}
declare type GetStatusRequestQuery = {}
declare type GetStatusRequestBody = {}
declare type GetStatusResponseBody =
  | {
      error: null
      status: 'online'
      serverTime: number
    }
  | APIError<null>

declare type StartRequestParams = {}
declare type StartRequestQuery = {}
declare type StartRequestBody = { password: string }
declare type StartResponseBody = { success: boolean } | APIError<null>
