import { BLOCKEXPLORERURL } from "../../../constants";
import fetch from "../../../middleware/fetch";
import { getError, getResult } from "../result";
import { Result } from "../result/types";

export const postTx = (
  tx: string,
): Promise<Result<string, APIError<"INTERNAL_SERVER_ERROR">>> =>
  new Promise((resolve) => {
    fetch(`${BLOCKEXPLORERURL}/tx`, {
      headers: { Accept: "text/html", "Content-Type": "text/html" },
      method: "POST",
      body: tx,
    })
      .then(async (response) => {
        if (response.status !== 200)
          return resolve(getError({ error: "INTERNAL_SERVER_ERROR" }));
        resolve(getResult(await response.text()));
      })
      .catch((err) =>
        resolve(getError({ error: "INTERNAL_SERVER_ERROR", message: err })),
      );
  });
