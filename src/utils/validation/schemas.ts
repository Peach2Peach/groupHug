import { z } from "zod";
const SHA256_LENGTH = 64;
const REVOCATION_TOKEN_LENGTH = 32;

export const FeeRateSchema = z.number().gte(1);
export const SHA256Schema = z.string().length(SHA256_LENGTH);
export const RevocationTokenSchema = z.string().length(REVOCATION_TOKEN_LENGTH);
