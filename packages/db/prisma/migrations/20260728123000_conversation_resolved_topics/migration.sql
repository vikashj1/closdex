-- Track which concerns the salesperson has already addressed so the lead
-- persona stops re-asking the same objection in different words.
ALTER TABLE "Conversation" ADD COLUMN "resolvedTopics" TEXT;
