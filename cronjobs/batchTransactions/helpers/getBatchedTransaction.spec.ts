import { Psbt, networks } from "bitcoinjs-lib";
import { expect } from "chai";
import { batchQueue } from "../../../test/data/psbtData";
import { getBatchedTransaction } from "./getBatchedTransaction";

describe("getBatchedTransaction", () => {
  it("should combine psbts into one", () => {
    const psbts = batchQueue
      .slice(0, 3)
      .map(({ psbt }) => Psbt.fromBase64(psbt, { network: networks.regtest }));
    const expected =
      "cHNidP8BAOICAAAAA+Mmp1kUa5WywnBqZrbcw5bp9PCt6A4d+aboCSRUoVGDAQAAAAD/////iZwzSKuuMYYaO82ryc7g9xK0Q5VJBRkZyr/uah5a9WgAAAAAAP//////+f9dP+LxaT+T9DYfQPTlXxwk1lZ6NjMTdPkRMifDqgEAAAAA/////wMieAEAAAAAABYAFHXXFfmoRVXnUncsmtYr6Qs7e7iKIngBAAAAAAAWABR11xX5qEVV51J3LJrWK+kLO3u4iiJ4AQAAAAAAFgAUddcV+ahFVedSdyya1ivpCzt7uIoAAAAAAAEBK6CGAQAAAAAAIgAgXx9NNJ/tAWMDVLRS7kVqyrH2jLKeicet/4fr1+TTxboiAgOPAkjMC+vEJetVrxaJpZ+IEZxpQwqGDGoF80DkRcQX10cwRAIgHS4rRSiXrI2fZ4Wfo8tdyTJ4I4eZDwGX2pG677MLqKoCIFd2cmMxcV8dyQRwspILR1fm9Rs7Zgt7Lo0y+Euq4Y93gwEDBIMAAAABBUdSIQOPAkjMC+vEJetVrxaJpZ+IEZxpQwqGDGoF80DkRcQX1yECmRmI46ZkIPZt2g6lwVe12H12GqiDFGsggnwSnD/OIZtSrgABASughgEAAAAAACIAIF8fTTSf7QFjA1S0Uu5Fasqx9oyynonHrf+H69fk08W6IgIDjwJIzAvrxCXrVa8WiaWfiBGcaUMKhgxqBfNA5EXEF9dIMEUCIQDIgJw5OknZ60dji7x3wtA9uB1OwfNDoOaGqdZQefUYIgIgdP5DN8Z/QCkHtEKxIZN2a4LTb3b0UiwbyD084zTNaAWDAQMEgwAAAAEFR1IhA48CSMwL68Ql61WvFomln4gRnGlDCoYMagXzQORFxBfXIQKZGYjjpmQg9m3aDqXBV7XYfXYaqIMUayCCfBKcP84hm1KuAAEBK6CGAQAAAAAAIgAgXx9NNJ/tAWMDVLRS7kVqyrH2jLKeicet/4fr1+TTxboiAgOPAkjMC+vEJetVrxaJpZ+IEZxpQwqGDGoF80DkRcQX10cwRAIgNeAynmcjERbJEG6PfrYaJb8hNHrl1f2wMDlFEU0uQWUCIGBw3ydxgEs6KvNAd1jV5ft+f68XNEjQaMPK1n2Q3ToKgwEDBIMAAAABBUdSIQOPAkjMC+vEJetVrxaJpZ+IEZxpQwqGDGoF80DkRcQX1yECmRmI46ZkIPZt2g6lwVe12H12GqiDFGsggnwSnD/OIZtSrgAAAAA=";
    expect(getBatchedTransaction(psbts, networks.regtest).toBase64()).to.equal(
      expected,
    );
  });
});
