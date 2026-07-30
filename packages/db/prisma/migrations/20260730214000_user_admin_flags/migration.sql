-- Admin controls: ban + soft-delete user rows. Anonymized users retain
-- their attempts/transactions for audit; banned users can log in again
-- once the timestamp is cleared.
ALTER TABLE "User" ADD COLUMN "bannedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "bannedReason" TEXT;
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);
