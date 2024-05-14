import { BLOCKEXPLORERURL } from "../../../constants";
import fetch from "../../../middleware/fetch";

export const getTx = (
  txId: string
): Promise<
  | { result: Transaction; error?: never }
  | (APIError<"INTERNAL_SERVER_ERROR"> & { result?: never })
> =>
  new Promise((resolve) => {
    fetch(`${BLOCKEXPLORERURL}/tx/${txId}`)
      .then(async (response) => {
        if (response.status !== 200) {
          return resolve({ error: "INTERNAL_SERVER_ERROR" });
        }
        resolve({ result: await response.json() });
      })
      .catch((err) =>
        resolve({ error: "INTERNAL_SERVER_ERROR", message: err })
      );
  });
