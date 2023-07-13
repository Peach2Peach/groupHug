import { strictEqual } from 'assert'
import { Request } from 'express'
import { describe, it } from 'mocha'
import { getClientIPAddress } from '.'
import { requestMock } from '../../../test/unit/controllers/expressMocks'

describe('getClientIPAddress', () => {
  it('gets IP address from regular request', () => {
    const request = requestMock({
      ip: '123.123.123.123',
      ips: ['123.123.123.123'],
    })

    strictEqual(getClientIPAddress(request as Request), '123.123.123.123')
  })
  it('gets IP address from request proxied by cloudflare', () => {
    const request = requestMock({
      ip: '255.255.255.255',
      ips: ['255.255.255.255'],
      headers: {
        'cf-connecting-ip': '123.123.123.123',
      },
    })

    strictEqual(getClientIPAddress(request as Request), '123.123.123.123')
  })
  it('falls back to ip when ip list is empty and no cf header', () => {
    const request = requestMock({
      ip: 'dummyIp',
      ips: [],
    })

    strictEqual(getClientIPAddress(request as Request), 'dummyIp')
  })
})
