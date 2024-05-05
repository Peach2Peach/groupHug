type AddPSBTRequestParams = {};
type AddPSBTRequestQuery = {};
type AddPSBTRequestBody = { psbt: string; index: number };
type AddPSBTResponseBody = { id: string; revocationToken: string };
type AddPSBTErrorResponseBody = APIError<null>;

type RevokePSBTRequestParams = {};
type RevokePSBTRequestQuery = {};
type RevokePSBTRequestBody = { id: string; revocationToken: string };
type RevokePSBTResponseBody = { success: boolean };
type RevokePSBTErrorResponseBody = APIError<null>;
