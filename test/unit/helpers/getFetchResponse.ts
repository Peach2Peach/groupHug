import { Response } from "node-fetch";

export const getFetchResponse = <T>(result: T, status = 200) =>
  ({
    json: () => Promise.resolve(result),
    text: () => Promise.resolve(String(result)),
    status,
  }) as Partial<Response>;
