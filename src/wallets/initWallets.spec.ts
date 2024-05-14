import { networks } from "bitcoinjs-lib";
import { expect } from "chai";
import { xpriv, xpub } from "../../test/data/walletData";
import { feeWallet } from "./feeWallet";
import { hotWallet } from "./hotWallet";
import { initWallets } from "./initWallets";

describe("initWallets", () => {
  it("initializes wallets", () => {
    initWallets(xpriv, xpriv, xpub, networks.regtest);
    expect(hotWallet.network).to.equal(networks.regtest);
    expect(hotWallet.toBase58()).to.equal(xpriv);
    expect(feeWallet.network).to.equal(networks.regtest);
    expect(feeWallet.toBase58()).to.equal(xpub);
  });
});
