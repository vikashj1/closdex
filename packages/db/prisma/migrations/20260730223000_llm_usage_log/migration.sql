CREATE TABLE "LlmUsageLog" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LlmUsageLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LlmUsageLog_createdAt_idx" ON "LlmUsageLog"("createdAt");
