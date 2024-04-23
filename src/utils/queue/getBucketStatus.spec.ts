import { expect } from "chai";
import { getBucketStatus } from "./getBucketStatus";
import { resetBucketExpiration } from "./resetBucketExpiration";
import { saveBucketStatus } from "./saveBucketStatus";

describe("getBucketStatus", () => {
  it("resets expiration for bucket at index", async () => {
    await Promise.all([
      saveBucketStatus({
        participants: 10,
        maxParticipants: 20,
      }),
      resetBucketExpiration(),
    ]);

    expect(await getBucketStatus()).to.deep.equal({
      participants: 10,
      maxParticipants: 20,
      timeRemaining: 600,
      completed: false,
    });
  });
});
