import { NextFunction, Request, Response } from 'express'

export const addResponseHeaders
  = (headers: Record<string, string>) => (req: Request, res: Response, next: NextFunction) => {
    Object.keys(headers).forEach((key) => {
      const value = headers[key]
      res.set(key, value)
    })
    next()
  }
