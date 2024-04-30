import { BLOCKEXPLORERURL } from "../../../constants";
import fetch from "../../../middleware/fetch";

export const getTipHeight = (): Promise<
  | { result: number; error?: never }
  | (APIError<"INTERNAL_SERVER_ERROR"> & { result?: never })
> =>
  new Promise((resolve) => {
    fetch(`${BLOCKEXPLORERURL}/blocks/tip/height`)
      .then(async (response) =>
        resolve({ result: Number(await response.text()) })
      )
      .catch((err) =>
        resolve({ error: "INTERNAL_SERVER_ERROR", message: err })
      );
  });
