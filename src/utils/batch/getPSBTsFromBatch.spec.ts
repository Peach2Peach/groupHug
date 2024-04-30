import { networks } from "bitcoinjs-lib";
import { expect } from "chai";
import { psbt1, psbt2, psbt3 } from "../../../test/data/psbtData";
import { db } from "../db";
import { addPSBTToBatchWithClient } from "./addPSBTToBatchWithClient";
import { getPSBTsFromBatch } from "./getPSBTsFromBatch";

describe("getPSBTsFromBatch", () => {
  const txId = "txId";
  it("get psbts from batch", async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        addPSBTToBatchWithClient(client, txId, psbt1.toBase64()),
        addPSBTToBatchWithClient(client, txId, psbt2.toBase64()),
        addPSBTToBatchWithClient(client, txId, psbt3.toBase64()),
      ]);
    });

    const batch = await getPSBTsFromBatch(txId, networks.regtest);
    expect(batch).to.deep.include(psbt1);
    expect(batch).to.deep.include(psbt2);
    expect(batch).to.deep.include(psbt3);
  });
});
