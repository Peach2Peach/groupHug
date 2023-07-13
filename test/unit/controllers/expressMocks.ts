import { Request, Response } from 'express'
import sinon from 'sinon'
import { PeachClient } from '../../../middleware/ws'

export const requestMock = (options = {}): Partial<Request> => {
  const ret = {}
  return Object.assign(
    ret,
    {
      accepts: sinon.stub().returns(ret),
      acceptsCharsets: sinon.stub().returns(ret),
      acceptsEncodings: sinon.stub().returns(ret),
      acceptsLanguages: sinon.stub().returns(ret),
      flash: sinon.stub().returns(ret),
      get: sinon.stub().returns(ret),
      is: sinon.stub().returns(ret),
      headers: {},
      params: {},
      body: {},
      query: {},
    },
    options,
  )
}

export const responseMock = (options = {}): Partial<Response> => {
  const ret = {}
  return Object.assign(
    ret,
    {
      append: sinon.stub().returns(ret),
      attachment: sinon.stub().returns(ret),
      clearCookie: sinon.stub().returns(ret),
      cookie: sinon.stub().returns(ret),
      download: sinon.stub().returns(ret),
      end: sinon.stub().returns(ret),
      get: sinon.stub().returns(ret),
      json: sinon.stub().returns(ret),
      jsonp: sinon.stub().returns(ret),
      links: sinon.stub().returns(ret),
      locals: {},
      location: sinon.stub().returns(ret),
      redirect: sinon.stub().returns(ret),
      render: sinon.stub().returns(ret),
      send: sinon.stub().returns(ret),
      sendFile: sinon.stub().returns(ret),
      sendStatus: sinon.stub().returns(ret),
      set: sinon.stub().returns(ret),
      status: sinon.stub().returns(ret),
      type: sinon.stub().returns(ret),
      vary: sinon.stub().returns(ret),
      write: sinon.stub().returns(ret),
      writeHead: sinon.stub().returns(ret),
    },
    options,
  )
}

export const peachClientMock = (options = {}): Partial<PeachClient> => {
  const ret = {}
  return Object.assign(ret, { socket: { send: sinon.stub().returns(ret) } as any }, options)
}
