import { db } from "../db";
import { KEYS } from "../db/keys";

type Props = {
  index: number;
  participants: number;
  maxParticipants: number;
  feeRange?: number[];
};

export const saveBucketStatus = ({
  index,
  participants,
  maxParticipants,
  feeRange,
}: Props) =>
  db.transaction((client) =>
    client.hset(KEYS.BUCKET.STATUS + String(index), {
      participants,
      maxParticipants,
      feeRange,
    }),
  );
