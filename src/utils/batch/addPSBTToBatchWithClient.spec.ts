import { expect } from "chai";
import { psbt1 } from "../../../test/data/psbtData";
import { sha256 } from "../crypto/sha256";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { addPSBTToBatchWithClient } from "./addPSBTToBatchWithClient";

describe("addPSBTToBatchWithClient", () => {
  it("stores psbt in database", async () => {
    const txId = "txId";
    await db.transaction((client) =>
      addPSBTToBatchWithClient(client, txId, psbt1.toBase64()),
    );
    expect(await db.client.sMembers(KEYS.BATCH + txId)).to.deep.equal([
      psbt1.toBase64(),
    ]);
    expect(
      await db.client.hGet(KEYS.PSBT.PREFIX + sha256(psbt1.toBase64()), "txId"),
    ).to.deep.equal(txId);
  });
});
