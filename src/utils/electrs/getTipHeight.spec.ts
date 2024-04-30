import { expect } from "chai";
import { describe, it } from "mocha";
import { BLOCKEXPLORERURL } from "../../../constants";
import { fetchStub } from "../../../test/unit/hooks";
import { getTipHeight } from "./getTipHeight";

describe("blockExplorer API", () => {
  it("getTipHeight", async () => {
    fetchStub.withArgs(`${BLOCKEXPLORERURL}/blocks/tip/height`).resolves({
      text: () => new Promise((resolve) => resolve("263")),
      status: 200,
    } as Response);
    const { result } = await getTipHeight();
    expect(result).to.deep.equal(263);
  });
  it("should handle errors", async () => {
    const errorMessage = new Error("error message");
    fetchStub
      .withArgs(`${BLOCKEXPLORERURL}/blocks/tip/height`)
      .rejects(errorMessage);

    const error = await getTipHeight();
    expect(error).to.deep.equals({
      error: "INTERNAL_SERVER_ERROR",
      message: errorMessage,
    });
  });
});
