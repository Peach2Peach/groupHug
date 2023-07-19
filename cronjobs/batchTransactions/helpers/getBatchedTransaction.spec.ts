import { Psbt, networks } from 'bitcoinjs-lib'
import { expect } from 'chai'
import { batchQueue } from '../../../test/data/psbtData'
import { getBatchedTransaction } from './getBatchedTransaction'

describe('getBatchedTransaction', () => {
  it('should combine psbts into one', () => {
    const psbts = batchQueue
      .slice(0, 3)
      .map(({ psbt }) => Psbt.fromBase64(psbt, { network: networks.regtest }))
    const expected =
      'cHNidP8BAOICAAAAA4wd/otRdhR88oHeRWak069EU0+2I1UkU6aXnkBCb2E1AQAAAAD/////x5PTxaeO94JIu+akwRIwuQsMpw/ZAaJ26N0Xg9KehwoBAAAAAP////9vuL26uUMGmgtj4Tjdrt95q9oZAroSmZH1oCYz673j/wEAAAAA/////wPCdQQAAAAAABYAFHXXFfmoRVXnUncsmtYr6Qs7e7iKwnUEAAAAAAAWABR11xX5qEVV51J3LJrWK+kLO3u4isJ1BAAAAAAAFgAUddcV+ahFVedSdyya1ivpCzt7uIoAAAAAAAEBK+CTBAAAAAAAIgAg3xrV6jsqWKz9WSczSt9rOGMU7FvZv7uT2NooQuavqCUiAgOPAkjMC+vEJetVrxaJpZ+IEZxpQwqGDGoF80DkRcQX10cwRAIgFs5Hw9jIRLJUdLmwmhNIeWEnBHxdzDEZtTfvxo6kSv8CIHjZxkKJLR0ozpVVl0/3ZJMzQzj2Zo/wXgB7a6RIHxQegwEDBIMAAAABBUdSIQOPAkjMC+vEJetVrxaJpZ+IEZxpQwqGDGoF80DkRcQX1yECyzCXqs6eiH5iA/BpHJGXen9elRAZFtLaW64ecprtzB9SrgABASvgkwQAAAAAACIAIJ1gGFkbsfTZj119u+b6qO2Jwa5n0abb3vuHkCP0USRCIgIDjwJIzAvrxCXrVa8WiaWfiBGcaUMKhgxqBfNA5EXEF9dIMEUCIQDOwqJWoryolBLomyeIdfYjirJ2s21YiX5zkGrrxf264QIgRYT+HgmkTgvRhsGwt/lKYq9oYvUV9AzpOq9NeCAtiM6DAQMEgwAAAAEFR1IhA48CSMwL68Ql61WvFomln4gRnGlDCoYMagXzQORFxBfXIQOe1/BLUUSKhSHBOgrL/zx2WV4ciLXdZNKMPEpFwPZ221KuAAEBK+CTBAAAAAAAIgAgnFB4sLU4QA3VLev36Zi4aNcAnRtfF7t6hE1oSzUJ+TQiAgOPAkjMC+vEJetVrxaJpZ+IEZxpQwqGDGoF80DkRcQX10cwRAIgGbHWqHsENC/sd+9tjGkThWqVPGhq2DVi7gorcQTNB6sCIBY8A1cPC3p+YLPtT9WUPMDH0Iy5vRrJIrPPHqqwwCZdgwEDBIMAAAABBUdSIQOPAkjMC+vEJetVrxaJpZ+IEZxpQwqGDGoF80DkRcQX1yECikb4KPpH0uUr61Pg79AENw4tOGtF2O5dP21A7bAcOoxSrgAAAAA='
    expect(getBatchedTransaction(psbts).toBase64()).to.equal(expected)
  })
})
