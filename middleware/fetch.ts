import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch'
import getLogger from '../src/utils/logger'
const logger = getLogger('fetch', 'log')

export default (url: RequestInfo, init?: RequestInit): Promise<Response> =>
  new Promise((resolve, reject) =>
    fetch(url, init)
      .then((response) => {
        logger.info([response.status, response.statusText, url as string])
        resolve(response)
      })
      .catch((err) => {
        logger.error([err.status, err.statusText, url as string, err])
        reject(err)
      }),
  )
