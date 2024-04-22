import { BLOCKEXPLORERURL } from "../../../constants";
import fetch from "../../../middleware/fetch";
import { getError, getResult } from "../result";
import { Result } from "../result/types";

export const getTipHeight = (): Promise<
  Result<number, APIError<"INTERNAL_SERVER_ERROR">>
> =>
  new Promise((resolve) => {
    fetch(`${BLOCKEXPLORERURL}/blocks/tip/height`)
      .then(async (response) =>
        resolve(getResult(Number(await response.text()))),
      )
      .catch((err) =>
        resolve(getError({ error: "INTERNAL_SERVER_ERROR", message: err })),
      );
  });
