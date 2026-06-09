-- Anti-cheat suspicion score + quarantine flag on ChallengeAttempt.
-- Computed at scoring time from each salesperson message's clientMeta.
-- Quarantined attempts keep their finalScore but are hidden from the
-- leaderboard until an admin reviews them.
ALTER TABLE "ChallengeAttempt"
  ADD COLUMN "suspicionScore" INTEGER,
  ADD COLUMN "quarantined" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN "suspicionFlags" JSONB;
