import { RegtestUtils } from 'regtest-client'

const APIPASS = 'satoshi'
const APIURL = 'http://localhost:8082/1'

export interface Unspent {
  value: number
  txId: string
  vout: number
  address?: string
  height?: number
}
export const regtestUtils = new RegtestUtils({ APIPASS, APIURL })
