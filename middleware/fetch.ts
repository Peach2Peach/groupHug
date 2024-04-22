import fetch, { RequestInfo, RequestInit, Response } from "node-fetch";
import { fetchLogger } from "./fetchLogger";

export default (url: RequestInfo, init?: RequestInit): Promise<Response> =>
  new Promise((resolve, reject) =>
    fetch(url, init)
      .then((response) => {
        fetchLogger.info([response.status, response.statusText, url as string]);
        resolve(response);
      })
      .catch((err) => {
        fetchLogger.error([err.status, err.statusText, url as string, err]);
        reject(err);
      }),
  );
