-- Post-attempt LLM reflection card so users can learn from failure.
ALTER TABLE "ChallengeAttempt" ADD COLUMN "reflection" JSONB;
