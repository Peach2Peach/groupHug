import { getTx } from '../../src/utils/electrs'

export const getConfirmations = (blockHeight: number) => async (txId: string) => {
  const result = await getTx(txId)
  let confirmations = 0
  if (!result.isError()) {
    const txBlockHeight = result.getValue().status.block_height
    if (txBlockHeight) confirmations = blockHeight - txBlockHeight
  }

  return { txId, confirmations }
}
