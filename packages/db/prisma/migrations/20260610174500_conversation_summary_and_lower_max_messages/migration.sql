-- Slice 124: rolling conversation summary on Conversation, drops the lead-LLM
-- input from "full history every turn" to "persona + summary + last 5 messages".
-- Plus tighten default maxMessages on existing challenges from 25 → 15 for the
-- ones still on the higher cap.
ALTER TABLE "Conversation"
  ADD COLUMN "summary" TEXT,
  ADD COLUMN "summaryUpToCount" INTEGER NOT NULL DEFAULT 0;

-- Pull live challenges that are still at 25 down to 15 so existing attempts
-- start saving tokens immediately. Custom-tuned challenges (other values)
-- stay where the admin put them.
UPDATE "Challenge" SET "maxMessages" = 15 WHERE "maxMessages" = 25;
