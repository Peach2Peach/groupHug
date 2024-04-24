import { BLOCKEXPLORERURL } from "../../../constants";
import fetch from "../../../middleware/fetch";
import { getError, getResult } from "../result";
import { Result } from "../result/types";

export const getTx = (
  txId: string
): Promise<Result<Transaction, APIError<"INTERNAL_SERVER_ERROR">>> =>
  new Promise((resolve) => {
    fetch(`${BLOCKEXPLORERURL}/tx/${txId}`)
      .then(async (response) => {
        if (response.status !== 200) {
          return resolve(getError({ error: "INTERNAL_SERVER_ERROR" }));
        }
        resolve(getResult(await response.json()));
      })
      .catch((err) =>
        resolve(getError({ error: "INTERNAL_SERVER_ERROR", message: err }))
      );
  });
