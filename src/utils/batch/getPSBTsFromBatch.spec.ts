import { expect } from "chai";
import { psbt1, psbt2, psbt3 } from "../../../test/data/psbtData";
import { db } from "../db";
import { addPSBTToBatchWithClient } from "./addPSBTToBatch";
import { getPSBTsFromBatch } from "./getPSBTsFromBatch";
import { networks } from "bitcoinjs-lib";

describe("getPSBTsFromBatch", () => {
  const txId = "txId";
  it("get psbts from batch", async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        addPSBTToBatchWithClient(client, txId, psbt1, 2),
        addPSBTToBatchWithClient(client, txId, psbt2, 4),
        addPSBTToBatchWithClient(client, txId, psbt3, 3),
      ]);
    });

    const batch = await getPSBTsFromBatch(txId, networks.regtest);
    expect(batch).to.deep.include(psbt1);
    expect(batch).to.deep.include(psbt2);
    expect(batch).to.deep.include(psbt3);
  });
});
