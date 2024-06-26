import { expect } from "chai";
import { describe, it } from "mocha";
import Sinon from "sinon";
import { decryptConfig } from ".";
import * as constants from "../../../constants";
import { encrypted, unencrypted } from "../../../test/data/envData";
import { setDecrypted } from "./decryptConfig";

describe("decryptConfig", () => {
  afterEach(() => {
    setDecrypted(false);
    Sinon.restore();
  });
  it("should throw error if config is not loaded", () => {
    Sinon.stub(constants, "DB_AUTH").get(() => undefined);
    Sinon.stub(constants, "PRIVKEY").get(() => undefined);
    Sinon.stub(constants, "OLD_PRIVKEY").get(() => undefined);
    Sinon.stub(constants, "FEE_COLLECTOR_PUBKEY").get(() => undefined);
    try {
      decryptConfig("password");
      throw new Error("Function did not throw an error");
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      expect(error.message).to.equal("Config not loaded");
    }
  });
  it("should throw error if password is incorrect", () => {
    Sinon.stub(constants, "PASSWORDPROTECTION").get(() => true);
    Sinon.stub(constants, "DB_AUTH").get(() => unencrypted.DB_AUTH);
    Sinon.stub(constants, "PRIVKEY").get(() => unencrypted.PRIVKEY);
    Sinon.stub(constants, "OLD_PRIVKEY").get(() => unencrypted.OLD_PRIVKEY);
    Sinon.stub(constants, "FEE_COLLECTOR_PUBKEY").get(
      () => unencrypted.FEE_COLLECTOR_PUBKEY,
    );
    try {
      decryptConfig("wrong");
      throw new Error("Function did not throw an error");
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      expect(error.message).to.equal("Password invalid");
    }
  });
  it("should return raw configs if password protection if off", () => {
    Sinon.stub(constants, "DB_AUTH").get(() => unencrypted.DB_AUTH);
    Sinon.stub(constants, "PRIVKEY").get(() => unencrypted.PRIVKEY);
    Sinon.stub(constants, "OLD_PRIVKEY").get(() => unencrypted.OLD_PRIVKEY);
    Sinon.stub(constants, "FEE_COLLECTOR_PUBKEY").get(
      () => unencrypted.FEE_COLLECTOR_PUBKEY,
    );
    Sinon.stub(constants, "PASSWORDPROTECTION").get(() => false);
    expect(decryptConfig("")).to.deep.equal(unencrypted);
  });
  it("should decrypt configs with password", () => {
    Sinon.stub(constants, "DB_AUTH").get(() => encrypted.DB_AUTH);
    Sinon.stub(constants, "PRIVKEY").get(() => encrypted.PRIVKEY);
    Sinon.stub(constants, "OLD_PRIVKEY").get(() => encrypted.OLD_PRIVKEY);
    Sinon.stub(constants, "FEE_COLLECTOR_PUBKEY").get(
      () => encrypted.FEE_COLLECTOR_PUBKEY,
    );
    Sinon.stub(constants, "PASSWORDPROTECTION").get(() => true);
    expect(decryptConfig("password")).to.deep.equal(unencrypted);
  });
});
