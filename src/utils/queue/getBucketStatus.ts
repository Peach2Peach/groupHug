import { db } from "../db";
import { KEYS } from "../db/keys";

export const getBucketStatus = async () => {
  const [rawParticipants, rawMaxParticipants] = await db.hmget(
    KEYS.BUCKET.STATUS,
    ["participants", "maxParticipants"]
  );

  const ttl = await db.client.ttl(KEYS.BUCKET.EXPIRATION);

  return {
    participants: Number(rawParticipants),
    maxParticipants: Number(rawMaxParticipants),
    timeRemaining: ttl,
    completed: false,
  };
};
