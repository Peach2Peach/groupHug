type GetStatusRequestParams = {};
type GetStatusRequestQuery = {};
type GetStatusRequestBody = {};
type GetStatusResponseBody =
  | {
      error: null;
      status: 'online';
      serverTime: number;
    }
  | APIError<null>;

type StartRequestParams = {};
type StartRequestQuery = {};
type StartRequestBody = { password: string };
type StartResponseBody = { success: boolean } | APIError<null>;
