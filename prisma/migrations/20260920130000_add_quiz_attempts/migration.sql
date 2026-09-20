-- Additive quiz metadata and attempt history migration.
ALTER TABLE "Quiz"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "category" TEXT,
  ADD COLUMN "difficulty" TEXT,
  ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "timeLimit" INTEGER,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Question"
  ADD COLUMN "explanation" TEXT,
  ADD COLUMN "points" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX "Question_quizId_idx" ON "Question"("quizId");
CREATE INDEX "Choice_questionId_idx" ON "Choice"("questionId");

CREATE TABLE "QuizAttempt" (
  "id" SERIAL NOT NULL,
  "quizId" INTEGER NOT NULL,
  "totalQuestions" INTEGER NOT NULL,
  "correctAnswers" INTEGER NOT NULL,
  "incorrectAnswers" INTEGER NOT NULL,
  "score" INTEGER NOT NULL,
  "percentage" DOUBLE PRECISION NOT NULL,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AttemptAnswer" (
  "id" SERIAL NOT NULL,
  "attemptId" INTEGER NOT NULL,
  "questionId" INTEGER NOT NULL,
  "selectedChoiceId" INTEGER,
  "correctChoiceId" INTEGER NOT NULL,
  "isCorrect" BOOLEAN NOT NULL,
  CONSTRAINT "AttemptAnswer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AttemptAnswer_attemptId_questionId_key" ON "AttemptAnswer"("attemptId", "questionId");
CREATE INDEX "QuizAttempt_quizId_completedAt_idx" ON "QuizAttempt"("quizId", "completedAt");
CREATE INDEX "AttemptAnswer_questionId_idx" ON "AttemptAnswer"("questionId");

ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey"
  FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_attemptId_fkey"
  FOREIGN KEY ("attemptId") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_questionId_fkey"
  FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_selectedChoiceId_fkey"
  FOREIGN KEY ("selectedChoiceId") REFERENCES "Choice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_correctChoiceId_fkey"
  FOREIGN KEY ("correctChoiceId") REFERENCES "Choice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
