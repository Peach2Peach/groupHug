import { db } from "../db";
import { KEYS } from "../db/keys";

type Props = {
  participants: number;
  maxParticipants: number;
};

export const saveBucketStatus = ({ participants, maxParticipants }: Props) =>
  db.transaction((client) =>
    client.hset(KEYS.BUCKET.STATUS, {
      participants,
      maxParticipants,
    }),
  );
