declare type Input = {
  txid: string;
  vout: number;
  prevout: {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address: string;
    value: number;
  };
  scriptsig: string;
  scriptsig_asm: string;
  inner_redeemscript_asm?: string;
  witness?: string[];
  inner_witnessscript_asm?: string;
  is_coinbase: boolean;
  sequence: number;
};

declare type Output = {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address?: string;
  value: number;
};

declare type TransactionStatus = {
  confirmed: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
};

declare type UTXO = {
  txid: string;
  vout: number;
  value: number;
  status: TransactionStatus;
};

declare type Transaction = {
  txid: string;
  version: number;
  locktime: number;
  vin: Input[];
  vout: Output[];
  size: number;
  weight: number;
  fee: number;
  value?: number;
  status: TransactionStatus;
};

declare type ChainStats = {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
};

declare type MempoolStats = {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
};

declare type Address = {
  address: string;
  chain_stats: ChainStats;
  mempool_stats: MempoolStats;
};

// electrs also returns the range of 1-25, extend values as needed
declare type TargetBlocks = "1" | "3" | "6" | "25" | "144" | "504" | "1008";
declare type ConfirmationTargets = {
  [key in TargetBlocks]: number;
};

declare type FeeRecommendation = {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
};
