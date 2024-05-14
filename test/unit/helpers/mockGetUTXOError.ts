import { BLOCKEXPLORERURL } from "../../../constants";
import { fetchStub } from "../hooks";
import { getFetchResponse } from "./getFetchResponse";

export const mockGetUTXOError = (
  address: string,
  error = "INTERNAL_SERVER_ERROR",
  status = 500,
) => {
  fetchStub
    .withArgs(`${BLOCKEXPLORERURL}/address/${address}/utxo`)
    .resolves(getFetchResponse(error, status));
};
