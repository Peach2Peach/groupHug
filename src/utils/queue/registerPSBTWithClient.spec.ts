import { expect } from "chai";
import { psbt1, psbtBase64_1 } from "../../../test/data/psbtData";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { registerPSBTWithClient } from "./registerPSBTWithClient";

describe("registerPSBTWithClient", () => {
  it("stores psbt data", async () => {
    const { result } = await db.transaction((client) =>
      registerPSBTWithClient(client, psbtBase64_1)
    );
    const { id, revocationToken } = result!;
    expect(await db.hgetall(KEYS.PSBT.PREFIX + id)).to.deep.equal({
      psbt: psbt1.toBase64(),
      revocationToken,
    });
  });
  it("stores psbt data with index for signing", async () => {
    const { result } = await db.transaction((client) =>
      registerPSBTWithClient(client, psbtBase64_1, 1)
    );
    const { id, revocationToken } = result!;
    expect(await db.hgetall(KEYS.PSBT.PREFIX + id)).to.deep.equal({
      psbt: psbt1.toBase64(),
      revocationToken,
      index: "1",
    });
  });
});
