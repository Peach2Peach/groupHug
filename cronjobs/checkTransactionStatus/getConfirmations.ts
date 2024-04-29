import { getTx } from "../../src/utils/electrs/getTx";

export const getConfirmations =
  (blockHeight: number) => async (txId: string) => {
    const { error, result } = await getTx(txId);
    let confirmations = 0;
    if (!error) {
      const txBlockHeight = result.status.block_height;
      if (txBlockHeight) confirmations = blockHeight - txBlockHeight;
    }

    return { txId, confirmations };
  };
