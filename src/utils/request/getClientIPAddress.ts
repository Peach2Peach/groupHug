import { Request } from 'express'

/**
 * @description Method to determine IP address
 * Compatible with cloudflare, fall back to regular IP information
 */
export const getClientIPAddress = (req: Request): string | null => {
  if (req.headers && req.headers['cf-connecting-ip']) return req.headers['cf-connecting-ip'].toString()
  return req.ips?.length > 0 ? req.ips.toString() : req.ip
}
