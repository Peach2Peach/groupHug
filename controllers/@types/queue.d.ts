type AddPSBTRequestParams = unknown;
type AddPSBTRequestQuery = unknown;
type AddPSBTRequestBody = { psbt: string; index?: number };
type AddPSBTResponseBody = { id: string; revocationToken: string };
type AddPSBTErrorResponseBody = APIError<null>;

type RevokePSBTRequestParams = unknown;
type RevokePSBTRequestQuery = unknown;
type RevokePSBTRequestBody = { id: string; revocationToken: string };
type RevokePSBTResponseBody = { success: boolean };
type RevokePSBTErrorResponseBody = APIError<null>;
