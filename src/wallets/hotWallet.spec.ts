import { networks } from "bitcoinjs-lib";
import { expect } from "chai";
import { xpriv } from "../../test/data/walletData";
import { hotWallet, loadHotWallet } from "./hotWallet";

describe("loadHotWallet", () => {
  it("initializes hot wallet with xpriv", () => {
    const wallet = loadHotWallet(xpriv, networks.regtest);
    expect(wallet).to.deep.equal(hotWallet);
    expect(hotWallet.network).to.equal(networks.regtest);
    expect(hotWallet.toBase58()).to.equal(xpriv);
  });
});
