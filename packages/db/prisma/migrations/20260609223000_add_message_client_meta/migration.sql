-- Anti-cheat client telemetry on salesperson messages (paste count, total
-- pasted chars, first-keystroke-to-send delta, char count). Nullable so the
-- migration is safe for existing rows and for LEAD/SYSTEM messages going
-- forward.
ALTER TABLE "Message" ADD COLUMN "clientMeta" JSONB;
