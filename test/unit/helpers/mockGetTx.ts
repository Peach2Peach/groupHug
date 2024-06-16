import { BLOCKEXPLORERURL } from "../../../constants";
import { fetchStub } from "../hooks";
import { getFetchResponse } from "./getFetchResponse";

export const mockGetTx = (
  txId: string,
  result: Transaction | string,
  status = 200,
) => {
  fetchStub
    .withArgs(`${BLOCKEXPLORERURL}/tx/${txId}`)
    .resolves(getFetchResponse(result, status));
};
