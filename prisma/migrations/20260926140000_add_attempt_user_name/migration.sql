ALTER TABLE "QuizAttempt"
ADD COLUMN "userName" TEXT NOT NULL DEFAULT 'Guest';

CREATE INDEX "QuizAttempt_userName_completedAt_idx"
ON "QuizAttempt"("userName", "completedAt");