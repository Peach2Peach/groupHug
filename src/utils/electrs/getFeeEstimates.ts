import { BLOCKEXPLORERURL } from '../../../constants'
import fetch from '../../../middleware/fetch'
import { round } from '../math'
import { getError, getResult } from '../result'
import { Result } from '../result/types'

const getFeeRecommendation = (targets: ConfirmationTargets): FeeRecommendation => ({
  fastestFee: round(targets['1'], 1),
  halfHourFee: round(targets['3'], 1),
  hourFee: round(targets['6'], 1),
  economyFee: round(targets['144'], 1),
  minimumFee: round(targets['1008'], 1),
})

export const getFeeEstimates = (): Promise<Result<FeeRecommendation, APIError<'INTERNAL_SERVER_ERROR'>>> =>
  new Promise((resolve) => {
    fetch(`${BLOCKEXPLORERURL}/fee-estimates`)
      .then(async (response) => resolve(getResult(getFeeRecommendation(await response.json()))))
      .catch((err) => resolve(getError({ error: 'INTERNAL_SERVER_ERROR', message: err })))
  })
