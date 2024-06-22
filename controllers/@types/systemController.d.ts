type GetStatusRequestParams = unknown;
type GetStatusRequestQuery = unknown;
type GetStatusRequestBody = unknown;
type GetStatusResponseBody =
  | {
      error: null;
      status: "online";
      serverTime: number;
    }
  | APIError<null>;

type StartRequestParams = unknown;
type StartRequestQuery = unknown;
type StartRequestBody = { password: string };
type StartResponseBody = { success: boolean } | APIError<null>;
