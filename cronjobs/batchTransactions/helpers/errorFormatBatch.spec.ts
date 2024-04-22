import { Psbt, networks } from "bitcoinjs-lib";
import { expect } from "chai";
import { batchQueue } from "../../../test/data/psbtData";
import { errorFormatBatch } from "./errorFormatBatch";

describe("errorFormatBatch", () => {
  const psbts = batchQueue.slice(0, 3).map(({ feeRate, psbt }) => ({
    feeRate,
    psbt: Psbt.fromBase64(psbt, { network: networks.regtest }),
  }));
  it("should calculate the available service fee based on utxo values", () => {
    expect(errorFormatBatch(psbts)).to.equal(
      '[{"feeRate":1.1,"psbt":"cHNidP8BAFICAAAAAeMmp1kUa5WywnBqZrbcw5bp9PCt6A4d+aboCSRUoVGDAQAAAAD/////ASJ4AQAAAAAAFgAUddcV+ahFVedSdyya1ivpCzt7uIoAAAAAAAEBK6CGAQAAAAAAIgAgXx9NNJ/tAWMDVLRS7kVqyrH2jLKeicet/4fr1+TTxboiAgOPAkjMC+vEJetVrxaJpZ+IEZxpQwqGDGoF80DkRcQX10cwRAIgHS4rRSiXrI2fZ4Wfo8tdyTJ4I4eZDwGX2pG677MLqKoCIFd2cmMxcV8dyQRwspILR1fm9Rs7Zgt7Lo0y+Euq4Y93gwEDBIMAAAABBUdSIQOPAkjMC+vEJetVrxaJpZ+IEZxpQwqGDGoF80DkRcQX1yECmRmI46ZkIPZt2g6lwVe12H12GqiDFGsggnwSnD/OIZtSrgAA"},{"feeRate":1.2,"psbt":"cHNidP8BAFICAAAAAYmcM0irrjGGGjvNq8nO4PcStEOVSQUZGcq/7moeWvVoAAAAAAD/////ASJ4AQAAAAAAFgAUddcV+ahFVedSdyya1ivpCzt7uIoAAAAAAAEBK6CGAQAAAAAAIgAgXx9NNJ/tAWMDVLRS7kVqyrH2jLKeicet/4fr1+TTxboiAgOPAkjMC+vEJetVrxaJpZ+IEZxpQwqGDGoF80DkRcQX10gwRQIhAMiAnDk6SdnrR2OLvHfC0D24HU7B80Og5oap1lB59RgiAiB0/kM3xn9AKQe0QrEhk3ZrgtNvdvRSLBvIPTzjNM1oBYMBAwSDAAAAAQVHUiEDjwJIzAvrxCXrVa8WiaWfiBGcaUMKhgxqBfNA5EXEF9chApkZiOOmZCD2bdoOpcFXtdh9dhqogxRrIIJ8Epw/ziGbUq4AAA=="},{"feeRate":1.5,"psbt":"cHNidP8BAFICAAAAAf/5/10/4vFpP5P0Nh9A9OVfHCTWVno2MxN0+REyJ8OqAQAAAAD/////ASJ4AQAAAAAAFgAUddcV+ahFVedSdyya1ivpCzt7uIoAAAAAAAEBK6CGAQAAAAAAIgAgXx9NNJ/tAWMDVLRS7kVqyrH2jLKeicet/4fr1+TTxboiAgOPAkjMC+vEJetVrxaJpZ+IEZxpQwqGDGoF80DkRcQX10cwRAIgNeAynmcjERbJEG6PfrYaJb8hNHrl1f2wMDlFEU0uQWUCIGBw3ydxgEs6KvNAd1jV5ft+f68XNEjQaMPK1n2Q3ToKgwEDBIMAAAABBUdSIQOPAkjMC+vEJetVrxaJpZ+IEZxpQwqGDGoF80DkRcQX1yECmRmI46ZkIPZt2g6lwVe12H12GqiDFGsggnwSnD/OIZtSrgAA"}]',
    );
  });
});
